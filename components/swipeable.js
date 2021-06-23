import React from "react";
import { useSwipeable } from "react-swipeable";

function Swipeable(props) {
  const { children, className, style, ...rest } = props;
 
  const eventHandlers = useSwipeable(rest);

  return (
    <div {...eventHandlers} style={style} className={className} onClick={()=> console.log('click')}>
      {children}
    </div>
  );
}

export default Swipeable;
