import { REACT_ELEMENT } from "./constant"

function createElement(
    type,
    properties,
    children
){
    let ref = properties.ref || null;
    let key = properties.key || null;
    // key ref 已经被单独提取出来 需要从 props中移除
    ['key','ref','__self','__source'].forEach(key => {
        delete properties[key];
    })
    let props = { ... properties };
    // <div>Hello<span>xxx1<span/><span>2</span></div>
    // 会被解析成 React.createElement("div", null, "Hello", React.createElement("span", null, "xxx1"), React.createElement("span", null, "2"));
    // 也就是说createElement第三个参数以及后面的参数都属于 children
    if(arguments.length > 3){
        props.children = Array.prototype.slice.call(arguments, 2);
    }else{
        // 如果是单个子元素 不转化成数组 否则后续挂载的时候还要单独判断
        props.children = children;
    }
    return {    
        $$typeof: REACT_ELEMENT,
        type,
        ref,
        key,
        props
    }
}

const React = {
    createElement
};

export default React;