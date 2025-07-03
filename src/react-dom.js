function render(VNode, containerDOM){
    console.log("render==>",VNode);
    // 1. 将虚拟DOM转换为真实DOM
    function createElement(vnode){
        let div;
        // 是标签
        if(typeof vnode.type === "string"){
            div = document.createElement(vnode.type);
        }
        
        if(vnode.props?.children){
            // 是数组
            if(Array.isArray(vnode.props?.children)){
                vnode.props?.children.forEach(item => {
                    div.appendChild(createElement(item))
                })
                // 是文本
            }else if(typeof vnode.props?.children === "string"){
                div.appendChild(document.createTextNode(vnode.props?.children));
            }
        }
        return div;
    }

    const dom = createElement(VNode); 
    containerDOM.appendChild(dom);
}

const ReactDOM = {
    render
}

export default ReactDOM;