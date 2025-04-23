import { Menu, Transition } from '@headlessui/react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { Fragment } from 'react'

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

type Theme = 'light' | 'dark' | 'system';

interface ThemeMenuProps {
  theme: string;
  setTheme: (theme: Theme) => void;
}

export default function ThemeMenu({ theme, setTheme }: ThemeMenuProps) {
  const current = themeOptions.find(opt => opt.value === theme) || themeOptions[2]
  return (
    <div className="relative inline-block text-left ml-4">
      <Menu as="div" className="relative">
        <Menu.Button
          aria-label="Theme menu"
          className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-800/70 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {current.icon && <current.icon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-200" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
            <div className="p-1">
              {themeOptions.map(opt => (
                <Menu.Item key={opt.value}>
                  {({ active }) => (
                    <button
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left text-base rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                        ${active ? 'bg-indigo-50 dark:bg-gray-800/70' : ''}
                        ${theme === opt.value ? 'font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setTheme(opt.value as Theme)}
                      aria-checked={theme === opt.value}
                      role="menuitemradio"
                    >
                      <opt.icon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                      {opt.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
