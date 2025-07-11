import { REACT_ELEMENT, REACT_FORWARD_REF_ELEMENT } from "./constant";
import { addEvent } from "./event";

// render是初始化渲染 挂载不等于初始化渲染 挂载只是初始化渲染的一个部分 在其他部分也可能发生挂载
function render(VNode, containerDOM){
    // 1.将虚拟 DOM转化成真实 DOM
    // 2.将得到的真实 DOM挂载到 containerDOM中
    mount(VNode, containerDOM)
}

// 挂载真实 DOM
// 第一个参数是挂载的虚拟节点
// 第二个参数是挂载的真实节点需要挂载的容器
function mount(VNode, containerDOM){
    let newDOM = createDOM(VNode);
    newDOM && containerDOM.appendChild(newDOM);
}

// 根据虚拟 DOM创建真实 DOM
function createDOM(VNode){
    // 1.根据 type类型创建元素 2.处理子元素 3.处理属性值
    const { type,props,ref  } = VNode;
    let dom;
    // forwardRef组件
    if(type && type.$$typeof === REACT_FORWARD_REF_ELEMENT){
        return getDOMByForwardRefFunction(VNode);
    }
    // 函数组件
    else if(typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT && type.IS_CLASS_COMPONENT){
        return getDomByClassComponent(VNode);
    }
    // 类组件
    else if(typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT){
        return getDomByFunctionComponent(VNode);
    }
    // 表示这是一个 react节点
    else if(type && VNode.$$typeof === REACT_ELEMENT){
        dom = document.createElement(type);
    }
    if(props){
        // 单个元素 且唯一子元素也是一个 react元素
        if(typeof props.children === 'object' && props.children.type){
            mount(props.children, dom)
        }else if(Array.isArray(props.children)){
            mountArray(props.children, dom)
        }else if(typeof props.children === 'string' || typeof props.children === 'number'){
            // 子元素是唯一子元素 且是一个文本节点
            dom.appendChild(document.createTextNode(props.children))
        }
    } 
    // TODO：处理属性值
    setPropsForDOM(dom, props);
    // 在生成真实 DOM时 将真实 DOM赋值给虚拟 DOM的 dom属性上
    VNode.dom = dom;
    // 当 ref有值时 将 dom传递给 ref.current
    ref && (ref.current = dom);
    return dom;
}
// 获取函数组件的真实 DOM
function getDomByFunctionComponent(VNode){
    let { type, props } = VNode;
    let renderVNode = type(props);
    if(!renderVNode) return null;
    return createDOM(renderVNode);
}

function getDomByClassComponent(VNode){
    let { type, props, ref } = VNode;
    let instance = new type(props);
    let renderVNode = instance.render();
    if(typeof ref === 'string'){
        instance.$refs = instance.$refs || {}
        instance.$refs[ref] = instance;
    }
    // 在生成 VNode时将 oldVNode挂载到实例上的 oldVNode属性上
    instance.oldVNode = renderVNode;
    ref && (ref.current = instance);
    if(!renderVNode) return null;
    return createDOM(renderVNode);
}

function getDOMByForwardRefFunction(VNode){
    // VNode = {
    //     $$typeof:REACT_FORWARD_REF_ELEMENT,
    //     render
    // }
    let { type, props, ref } = VNode;
    // 调用 render来设置 ref
    let renderVNode = type.render(props, ref);
    if(!renderVNode) return null;
    return createDOM(renderVNode);
}

function setPropsForDOM(dom, VNodeProps={}){
    if(!dom) return ;
    for(let key in VNodeProps){
        if(key === 'children') continue;
        if(/^on[A-Z].*/.test(key)){
            // 事件处理
            addEvent(dom, key.toLowerCase(), VNodeProps[key])
        }else if(key === 'style'){
            Object.keys(VNodeProps[key]).forEach(styleName=>{
                dom.style[styleName] = VNodeProps[key][styleName]; 
            })
        }else{
            dom[key] = VNodeProps[key]
        }
    }
}

function mountArray(children, parent){
    // 如果不是数组 直接返回
    if(!Array.isArray(children)) return ;
    for(let i = 0;i< children.length;i++){
        // 如果是一个文本节点
        if(typeof children[i] === 'string' || typeof children[i] === 'number'){
            parent.appendChild(document.createTextNode(children[i]));
        }else{
            // 挂载真实元素
            mount(children[i], parent);
        }
    }
}

export function findDOMByVNode(VNode){
    // 如果没有 VNode则不处理
    if(!VNode) return ;
    if(VNode.dom) return VNode.dom;
}

// 根据新的 VNode更新 DOM树
export function updateDOMTree(oldDOM, newVNode){
    // 获取旧的 dom的父节点
    let parentNode = oldDOM.parentNode;
    // 将旧节点全部移除
    parentNode.removeChild(oldDOM);
    parentNode.appendChild(createDOM(newVNode));
}



const ReactDOM = {
    render
}

export default ReactDOM;