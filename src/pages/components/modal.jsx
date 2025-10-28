import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import Icon from "@/components/ui/Icon";

const Modal = ({
  activeModal,
  onClose,
  noFade,
  disableBackdrop,
  className = "max-w-md",
  children,
  footerContent,
  centered = true,
  scrollContent,
  themeClass = "bg-slate-900 dark:bg-slate-800 dark:border-b dark:border-slate-700",
  title = "Basic Modal",
  uncontrol,
  label = "Basic Modal",
  labelClass,
  ref,
}) => {
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(!showModal);
  const returnNull = () => null;

  const Wrapper = ({ isControlled }) => (
    <Transition appear show={isControlled ? activeModal : showModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[99999]"
        onClose={!disableBackdrop ? (isControlled ? onClose : closeModal) : returnNull}
      >
        {/*  Backdrop */}
        {!disableBackdrop && (
          <Transition.Child
            as={Fragment}
            enter={noFade ? "" : "duration-300 ease-out"}
            enterFrom={noFade ? "" : "opacity-0"}
            enterTo={noFade ? "" : "opacity-100"}
            leave={noFade ? "" : "duration-200 ease-in"}
            leaveFrom={noFade ? "" : "opacity-100"}
            leaveTo={noFade ? "" : "opacity-0"}
          >
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          </Transition.Child>
        )}

        {/* 🔹 Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div
            className={`flex min-h-full justify-center items-center text-center p-4`}
          >
            <Transition.Child
              as={Fragment}
              enter={noFade ? "" : "duration-300 ease-out"}
              enterFrom={noFade ? "" : "opacity-0 scale-95"}
              enterTo={noFade ? "" : "opacity-100 scale-100"}
              leave={noFade ? "" : "duration-200 ease-in"}
              leaveFrom={noFade ? "" : "opacity-100 scale-100"}
              leaveTo={noFade ? "" : "opacity-0 scale-95"}
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 text-left align-middle shadow-2xl transition-all ${className}`}
              >
                {/*  Header */}
                <div
                  className={`relative py-3 px-4 text-white flex justify-between  ${themeClass}`}
                >
                  <h2 className="capitalize leading-6 tracking-wider font-medium text-base text-white">
                    {title}
                  </h2>
                  <button onClick={isControlled ? onClose : closeModal} className="text-[22px]">
                    <Icon icon="heroicons-outline:x" />
                  </button>
                </div>

                {/* 🔹 Body */}
                <div
                  className={`px-6 py-6 flex flex-col items-center text-center ${scrollContent ? "overflow-y-auto max-h-[400px]" : ""
                    }`}
                >
                  {children}
                </div>

                {/* 🔹 Footer */}
                {footerContent && (
                  <div className="px-4 py-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                    {footerContent}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  return (
    <>
      {uncontrol ? (
        <>
          <button
            type="button"
            onClick={openModal}
            className={`btn ${labelClass}`}
          >
            {label}
          </button>
          <Wrapper isControlled={false} />
        </>
      ) : (
        <Wrapper isControlled={true} />
      )}
    </>
  );
};

export default Modal;