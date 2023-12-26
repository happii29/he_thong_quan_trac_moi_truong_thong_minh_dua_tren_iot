import { IconContext } from "react-icons";

import { forwardRef } from "react";

import {
  RiArrowLeftSFill,
  RiArrowRightSFill
} from 'react-icons/ri'


const icons = {
  arrowLeftSFill: <RiArrowLeftSFill />, 
  arrowRightSFill: <RiArrowRightSFill />,
}


const Icon = forwardRef((props, ref) => {
  const {
    icon,
    size,
    className,
    wrapperClassName,
    onClick,
    title,
    stopPropagation,
    disabled,
    ...other
  } = props;

  const handleClick = (e) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (disabled) return;
    if (onClick) {
      onClick();
    }
  };

  return (
    <span
      onClick={handleClick}
      title={title}
      ref={ref}
      {...other}
      aria-hidden="true"
      className={wrapperClassName || ""}
      style={{color: 'white'}}
    >
      <IconContext.Provider
        value={{
          size,
          className
        }}
      >
        {icons[icon]}
      </IconContext.Provider>
    </span>
  );
});

export default Icon;
