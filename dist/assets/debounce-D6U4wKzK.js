function u(e,i){let t;return function(...o){t&&clearTimeout(t),t=setTimeout(()=>{e.apply(this,o)},i)}}export{u as debounce};
