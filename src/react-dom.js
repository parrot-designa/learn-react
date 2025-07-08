import { REACT_ELEMENT } from "./constant";

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
    const { type,props  } = VNode;
    let dom;
    // 表示这是一个 react节点
    if(type && VNode.$$typeof === REACT_ELEMENT){
        dom = document.createElement(type);
    }
    if(props){
        // 单个元素 且唯一子元素也是一个 react元素
        if(typeof props.children === 'object' && props.children.type){
            mount(props.children, dom)
        }else if(Array.isArray(props.children)){
            mountArray(props.children, dom)
        }else if(typeof props.children === 'string'){
            // 子元素是唯一子元素 且是一个文本节点
            dom.appendChild(document.createTextNode(props.children))
        }
    }
    // TODO：处理属性值
    setPropsForDOM(dom, props);
    return dom;
}

function setPropsForDOM(dom, VNodeProps={}){
    if(!dom) return ;
    for(let key in VNodeProps){
        if(key === 'children') continue;
        if(/^on[A-Z].*/.test(key)){
            // TODO:事件处理
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
        if(typeof children[i] === 'string'){
            parent.appendChild(document.createTextNode(children[i]));
        }else{
            // 挂载真实元素
            mount(children[i], parent);
        }
    }
}



const ReactDOM = {
    render
}

export default ReactDOM;