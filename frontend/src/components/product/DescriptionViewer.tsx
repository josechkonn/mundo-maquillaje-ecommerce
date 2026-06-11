import { useState } from "react";
import Modal from "../ui/Modal";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface DescriptionViewerProps {
  description: string;
  name: string;
  maxLength?: number;
}

const DescriptionViewer = ({ description, name, maxLength = 250 }: DescriptionViewerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldTruncate = description?.length > maxLength;
  const displayDescription = shouldTruncate 
    ? description.substring(0, maxLength) + "..." 
    : description;

  if (!description) return null;

  return (
    <div className="pt-8 mt-8">
      {/* Label P normal con barra abajo */}
      <div className="border-b-[1px] border-brand-200 pb-2 mb-6">
        <p className="text-p-b text-text-base font-normal">
          Descripción del producto
        </p>
      </div>
      
      <div className="relative">
        <p className="text-p-s text-text-muted leading-relaxed whitespace-pre-line text-justify">
          {displayDescription}
        </p>

        {shouldTruncate && (
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-text-muted font-normal text-p-s mt-2 hover:text-brand-500 transition-all group"
            >
              Ver más
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Descripción - ${name}`}
        maxWidth="3xl"
      >
        <div className="p-8 text-text-base leading-relaxed whitespace-pre-line text-justify text-p-b">
          {description}
        </div>
      </Modal>
    </div>
  );
};

export default DescriptionViewer;
