// import React from "react";
// import { Link } from "react-router-dom";
// import { BookOpen } from "lucide-react";
// import { motion } from "framer-motion";


// const Logo: React.FC = () => {
//     return (
//         <motion.div
//             className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3 }}
//         >
//             <Link to="/" className="flex items-center space-x-2">
//                 <BookOpen className="h-8 w-8 text-indigo-600" />
//                 <span className="text-xl font-bold text-indigo-600">LearnTrack</span>
//             </Link>
//         </motion.div>
//     );
// };

// export default Logo;


import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LabelVisibility } from '../../../../shared/src/types';

interface LogoProps {
  labelVisibility?: LabelVisibility;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<'sm' | 'md' | 'lg' | 'xl', { icon: string; text: string }> = {
  sm: {icon:'h-6 2-6', text: 'text-sm'},
  md: {icon:'h-8 w-8', text: 'text-lg'},
  lg: {icon:'h-12 w-12', text: 'text-xl'},
  xl: {icon:'h-16 w-16', text: 'text-2xl'},
};

export const Logo: React.FC<LogoProps> = ({ labelVisibility = 'always', size='md' }) => (
  <Link to="/" className="flex items-center">
    <BookOpen className={`${sizes[size].icon} text-primary-800`} />
    <span className={cn(
      `${sizes[size].text} ml-2 font-bold text-primary-800 whitespace-nowrap`,
      labelVisibility === 'hover' && "lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
      labelVisibility === 'never' && "hidden"
    )}>
      LearnTrack
    </span>
  </Link>
);