import { updaterQueue,flushUpdaterQueue } from "./Component"

export function addEvent(dom, eventName, bindFunction){
    // 直接绑定在 document上存在一个问题 就是如何知道这个dom上绑定了哪些事件呢？
    // 所以需要将这个事件和元素进行绑定
    dom.attach = dom.attach || {};
    dom.attach[eventName] = bindFunction;
    // 事件合成机制核心点一： 事件绑定到 document
    // 由于冒泡机制 在 document上绑定事件 点击页面内的任意元素 都会触发在 document上绑定的事件
    document[eventName] = dispatchEvent
}

function dispatchEvent(nativeEvent){
    // nativeEvent中的 target表示触发事件的真实节点 
    // 事件触发时设置批量更新
    updaterQueue.isBatch = true;

    // 事件合成机制核心点二：屏蔽浏览器之间的差异
    let syntheticEvent = createSyntheticevent(nativeEvent);
    // 事件源
    let target = nativeEvent.target;
    // 事件冒泡 子元素的事件一直向上触发父元素
    while(target){
        // 
        syntheticEvent.currentTarget = target
        let eventName = `on${nativeEvent.type}`
        let bindFunction = target.attach && target.attach[eventName]
        // 执行真正的绑定方法
        bindFunction && bindFunction(syntheticEvent);
        // 如果阻止冒泡 直接跳出循环
        if(syntheticEvent.isPropagationStopped){
            break;
        }
        target = target.parentNode
    }

    flushUpdaterQueue();
}

function createSyntheticevent(nativeEvent){
    // 获取 nativeEvent上面的所有属性
    let nativeEventKeyValues = {};
    // 不可以使用 Object.keys进行遍历
    for(let key in nativeEvent){
        nativeEventKeyValues[key] = typeof nativeEvent[key] === 'function' ? nativeEvent[key].bind(nativeEvent) : nativeEvent[key];
    }
    // 合成事件对象
    let syntheticEvent = Object.assign(nativeEventKeyValues,{
        nativeEvent,
        isDefaultPrevented: false,
        isPropagationStopped: false,
        preventDefault: function(){
            this.isDefaultPrevented = true;
            // 消除浏览器差异
            if(this.nativeEvent.preventDefault){
                this.nativeEvent.preventDefault()
            }else{
                this.nativeEvent.returnValue = false;
            }
        },
        stopPropagation:function(){
            this.isPropagationStopped = true;
            // 消除浏览器差异
            if(this.nativeEvent.stopPropagation){
                this.nativeEvent.stopPropagation()
            }else{
                this.nativeEvent.cancelBubble = true;
            }
        }
    })
    return syntheticEvent;
}