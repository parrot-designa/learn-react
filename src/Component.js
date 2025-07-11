import { findDOMByVNode,updateDOMTree } from "./react-dom";

export let updaterQueue = {
    isBatch: false,
    // 存储组件的更新器 使用 Set避免重复添加组件
    updaters: new Set()
}

export function flushUpdaterQueue(){
    updaterQueue.isBatch = false;
    for(let updater of updaterQueue.updaters){
        updater.launchUpdate()
    }
    updaterQueue.updaters.clear();
}

// 为了批量更新
class Updater {
    constructor(classComponentInstance){
        this.classComponentInstance = classComponentInstance;
        // 存储每次更改的属性值 最后进行一次性合并
        this.pendingStates = [];
    }
    // 增加 state
    addState(partialState){
        this.pendingStates.push(partialState);
        // 处理批量更新
        this.preHandleForUpdate();
    }
    preHandleForUpdate(){
        // 是否需要批量处理 如果需要批量处理 则不进行更新 继续向 pendingStates中添加变化值、
        // isBatch只是一个操作阶段 如果不是 isBatch 则表示可以直接更新
        // 如果 isBatch是true 每一个组件都对应着有一个 updater 在批量更新期间 可能会存在多个 updater(目前暂时还不明确是什么情况 可能是父子组件更新的情况)
        if(updaterQueue.isBatch){
            updaterQueue.updaters.add(this);
        }
        // 如果不是批量更新 即需要立即渲染页面 
        else{
            this.launchUpdate();
        }
    }

    //启动更新
    launchUpdate(){
        const { classComponentInstance,pendingStates } = this;
        // 如果没有需要更新的state 直接返回 不进行更新
        if(pendingStates.length === 0) return ;
        classComponentInstance.state = this.pendingStates.reduce((prevState,nextState)=>{
            return {
                ...prevState,
                ...nextState
            }   
        },classComponentInstance.state);
        this.pendingStates.length = 0;
        // 调用 update进行更新
        classComponentInstance.update();
    }

}
export class Component {
    // 标识这是一个类组件
    static IS_CLASS_COMPONENT = true;
    constructor(props){
        // 更新器 对更新的内容进行管理
        this.updater = new Updater(this);
        this.state = {};
        this.props = props;
    }

    setState(partialState){
        /**
            * ===========================版本1========================
            *  这里的partialState代表部分 state 
            正常开发中会发生如下代码：
            默认状态有 2 个 state值
            this.state = {
                a:"1",
                b:"2"
            }
            // 然后使用 setState对状态值进行更新
            this.setState({
                a:"1",
                c:"3"
            })
            // 打印值以后会变成三个状态值 分别是 a:"1",b:"2",c:"3"
            console.log(this.state);
            所以我们这里可以使用以下步骤对状态值进行合并
            // 1. 合并属性
            this.state = { ...this.state, ...partialState }
            // 2. 重新渲染并进行更新
            this.update()
            * ==========================版本 2==========================
            * 但是上面这种写法无法做到批量更新 所谓批量更新就是在同一个方法内多次调用 this.setState 如下代码：
            * this.setState({a:1})
            * this.setState({a:2})
            * 不可能在每一次执行调用 setState就要更新一次 这样肯定会造成重复渲染的情况
            * 针对批量更新的情况 react新增了一个 Updater类 专门用作管理 state值的状态 
            * 其中类上的 pendingStates就是存储每次调用 setState时需要改变的 state变化值
            * addState就是将setState的变化值push进这个 pendingStates中
            * 所以会有以下代码：
            * 1.调用 updater.addState将 state变化值 push进 pendingStates中
            * updater.addState(partialState)
            * 2.在开发中我们只会调用 setState让状态值进行变化 然后就会自动更新 既然我们将这个 state变化值保存了起来 所以肯定不能在setState方法中进行更新了 那么什么时候进行更新呢？
            * 这里直接看updater.preHandleForUpdate方法 都写了注释
            * 
         */ 
            this.updater.addState(partialState)
    }

    update(){
        // 1. 获取重新执行 render函数后的虚拟 DOM 新虚拟 DOM
        // 2. 根据新的虚拟 DOM生成真实 DOM
        // 3. 将真实 DOM挂载到页面上
        let oldVNode = this.oldVNode; // TODO: 让类组件拥有一个 oldVNode属性保存类组件实例对应的虚拟 DOM
        let oldDOM = findDOMByVNode(oldVNode) // TODO: 将真实 DOM保存到对应的虚拟 DOM 上
        let newVNode = this.render();
        updateDOMTree(oldDOM, newVNode);
        // 当更新完以后 当前 VNode就变成了上一次渲染的 VNode 用于下次渲染时需要的对比依赖项
        this.oldVNode = newVNode;
    }
}