import {
  cloneElement,
  createContext,
  Dispatch,
  Fragment,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { classNames } from "../../shared/helpers/classNamer";
import { Drawer, useMediaQuery } from "@geist-ui/core";

const callAll =
  (...fns: any) =>
  (...args: any) =>
    fns.forEach((fn: any) => fn && fn(...args));
const ModalContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | any
>([]);

const Modal: React.FC<{
  onClose?: () => void;
  children: React.ReactElement[];
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { onClose: onCloseFn } = props;
  const onClose = () => {
    onCloseFn?.();
    setIsOpen(false);
  };
  return (
    <ModalContext.Provider value={[isOpen, setIsOpen, onClose]} {...props} />
  );
};

const ModalOpenButton: React.FC<{ children: React.ReactElement }> = ({
  children: child,
}) => {
  const [, setIsOpen] = useContext(ModalContext);

  return cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  });
};

const ModalContentBase: React.FC<{ children: React.ReactNode }> = (props) => {
  const [isOpen, setIsOpen, onClose] = useContext(ModalContext);
  const isMobile = useMediaQuery("mobile");

  if (isMobile) {
    return (
      <Drawer
        visible={isOpen}
        placement="bottom"
        onClose={() => setIsOpen(false)}
      >
        {props.children}
      </Drawer>
    );
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} unmount={true}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-400/25 dark:bg-black/50 backdrop-blur-sm transition-opacity z-20" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  "relative transform rounded-lg bg-white dark:bg-[#0C0C0C] px-4 pt-5 pb-4 text-left text-white transition-all",
                  "border border-neutral-300/80 dark:border-neutral-900",
                  "w-full sm:my-8 sm:max-w-md sm:p-6"
                )}
              >
                {props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const ModalContents: React.FC<{
  children: ({ close }: { close: () => void }) => React.ReactNode;
}> = ({ children }) => {
  const [, setIsOpen] = useContext(ModalContext);
  return (
    <ModalContentBase>
      {children({ close: () => setIsOpen(false) })}
    </ModalContentBase>
  );
};

export { Modal, ModalContents, ModalOpenButton };
