import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LinkProps{
  to:string,
  children:ReactNode,
  className:string, 
  onClick?: ()=>void
}

export const Link = ({ to, children, className, onClick }:LinkProps) => {
      const navigate = useNavigate();
      
      const handleClick = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      };
      
      return (
        <a href="javascript:void(0)" onClick={()=>handleClick} className={className}>
          {children}
        </a>
      );
    };