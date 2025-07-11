import React from './react';
// ============================= 函数组件 ============================
function MyFunctionComponent(props){
    return <div style={{color:'red'}}>
      Hello Function Component 
    </div>
  }
   
// ============================= 类组件 ============================
export class MyClassComponent extends React.Component{
  
    constructor(props){
      super(props);
      this.state = {
        count: 1
      } 
      this.testDOMRef = React.createRef();
    }
  
    updateCounter(){
      console.log(this.testDOMRef)
      this.setState({
        count: this.state.count + 1
      })
    }
  
    render(){
      return <div ref={this.testDOMRef} style={{color:'red',border:"1px solid red"}} onClick={() => this.updateCounter()}>
        Hello Class Component 
        <span>{this.state.count}</span>
      </div>
    }
}  

// 测试组件 ref
export class TestComponentRef extends React.Component{
    constructor(props){
        super(props);
        this.componentRef = React.createRef();
    }
    render(){
        return <div onClick={()=>console.log(this.componentRef)}>
            <MyClassComponent ref={this.componentRef}/>
        </div>
    }
}

export const FunctionComponent = React.forwardRef(function FunctionComponent(props, ref){
    return <div ref={ref}>测试</div>
})
// 测试函数组件 ref
export class TestFunctionComponentRef extends React.Component{
    constructor(props){
        super(props);
        this.componentRef = React.createRef();
    }
    render(){
        return <div onClick={()=>console.log(this.componentRef)}>
            <FunctionComponent ref={this.componentRef}/>
        </div>
    }
}