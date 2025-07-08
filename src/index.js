import React from './react';
import ReactDOM from './react-dom';
 
ReactDOM.render(<div style={{color:'red'}}>
  Hello World
  <span style={{color:'yellow'}}>xxx1</span>
  <span style={{color:'green'}}>xxx2</span>
</div>, document.getElementById('root'));

console.log(<div style={{color:'red'}}>
  Hello World
  <span>xxx1</span>
  <span>xxx2</span>
</div>);

