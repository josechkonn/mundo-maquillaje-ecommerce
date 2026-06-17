import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useCallback, useRef } from "react";

const TEXT_COLORS = [
  "#222222",
  "#E7446B",
  "#E11546",
  "#CD1340",
  "#8B7177",
  "#54D027",
  "#2563EB",
  "#9333EA",
  "#EA580C",
  "#CA8A04",
  "#FFFFFF",
];

const HIGHLIGHT_COLORS = [
  "transparent",
  "#FCE8ED",
  "#F6B6C6",
  "#FEF08A",
  "#C6F6D5",
  "#DBEAFE",
  "#E9D5FF",
  "#FECACA",
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

const normalizeHtml = (html: string): string => {
  if (!html) return "";
  const stripped = html.replace(/<\/?p>/g, "").replace(/<br\s*\/?>/g, "").trim();
  if (!stripped) return "";
  return html;
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  disabled = false,
  minHeight = "120px",
}: RichTextEditorProps) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isSettingContent = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "rich-link" },
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (isSettingContent.current) return;
      const html = editor.getHTML();
      const isEmpty = normalizeHtml(html) === "";
      onChangeRef.current(isEmpty ? "" : html);
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentText = editor.getText().trim();
      const incomingNormalized = normalizeHtml(value || "");
      if (incomingNormalized === "" && currentText === "") return;
      const currentHTML = editor.getHTML();
      const currentNormalized = normalizeHtml(currentHTML);
      if (currentNormalized !== incomingNormalized) {
        isSettingContent.current = true;
        editor.commands.setContent(value || "");
        requestAnimationFrame(() => { isSettingContent.current = false; });
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL del enlace:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) return null;

  const btnBase =
    "p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const btnActive = "!bg-brand-400 !text-white";
  const btnInactive = "text-text-muted hover:bg-neutral-100 hover:text-text-base";

  return (
    <div className="rich-text-editor border border-neutral-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-200 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 bg-neutral-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("bold") ? btnActive : btnInactive}`}
          title="Negrita"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("italic") ? btnActive : btnInactive}`}
          title="Cursiva"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("underline") ? btnActive : btnInactive}`}
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("strike") ? btnActive : btnInactive}`}
          title="Tachado"
        >
          <StrikethroughIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={`${btnBase} text-xs font-bold ${editor.isActive("heading", { level: 2 }) ? btnActive : btnInactive}`}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={`${btnBase} text-xs font-bold ${editor.isActive("heading", { level: 3 }) ? btnActive : btnInactive}`}
          title="Título 3"
        >
          H3
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : btnInactive}`}
          title="Lista con viñetas"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : btnInactive}`}
          title="Lista numerada"
        >
          <NumberedListIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive({ textAlign: "left" }) ? btnActive : btnInactive}`}
          title="Alinear izquierda"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive({ textAlign: "center" }) ? btnActive : btnInactive}`}
          title="Centrar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive({ textAlign: "right" }) ? btnActive : btnInactive}`}
          title="Alinear derecha"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <div className="relative group">
          <button
            type="button"
            disabled={disabled}
            className={`${btnBase} ${btnInactive}`}
            title="Color de texto"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold leading-none">A</span>
              <span
                className="w-4 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: editor.getAttributes("textStyle").color || "#222222" }}
              />
            </div>
          </button>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-col bg-white border border-neutral-200 rounded-xl shadow-lg p-2 min-w-[140px]">
            <span className="text-[10px] font-bold text-text-muted mb-1 px-1">Color</span>
            <div className="grid grid-cols-6 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${editor.getAttributes("textStyle").color === color ? "border-brand-500 scale-110" : "border-neutral-200"}`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {color === "#FFFFFF" && <span className="text-neutral-400 text-[8px]">—</span>}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="text-[10px] text-text-muted hover:text-brand-500 mt-1 px-1"
            >
              Quitar color
            </button>
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            disabled={disabled}
            className={`${btnBase} ${editor.isActive("highlight") ? btnActive : btnInactive}`}
            title="Resaltado"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3L3 21h18L12 3z"/><line x1="7" y1="15" x2="17" y2="15" strokeWidth="3"/></svg>
          </button>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-col bg-white border border-neutral-200 rounded-xl shadow-lg p-2 min-w-[140px]">
            <span className="text-[10px] font-bold text-text-muted mb-1 px-1">Resaltado</span>
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    if (color === "transparent") {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().toggleHighlight({ color }).run();
                    }
                  }}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${color === "transparent" ? "border-neutral-300 bg-white" : "border-neutral-200"}`}
                  style={{ backgroundColor: color === "transparent" ? "white" : color }}
                  title={color === "transparent" ? "Sin resaltado" : color}
                >
                  {color === "transparent" && <span className="text-xs text-neutral-400">✕</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={setLink}
          disabled={disabled}
          className={`${btnBase} ${editor.isActive("link") ? btnActive : btnInactive}`}
          title="Insertar enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;