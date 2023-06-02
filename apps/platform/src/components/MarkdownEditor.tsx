import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { Options } from "easymde";
import { useAtom } from "jotai";
import { markdownEditorValueAtom } from "@/atoms";

const SimpleMDEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const options: Options = {
  autofocus: true,
  spellChecker: false,
  placeholder: "Please Enter Markdown Text",
  toolbar: [
    "bold",
    "italic",
    "strikethrough",
    "heading-1",
    "heading-2",
    "heading-3",
    "heading-smaller",
    "heading-bigger",
    "|",
    "code",
    "|",
    "quote",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    "image",
    "table",
    "horizontal-rule",
    "|",
    "guide",
  ],
};

export default function MarkdownEditor() {
  const [editorValue, setEditorValue] = useAtom(markdownEditorValueAtom);

  const handleEditorValue = (value: string) => {
    setEditorValue(value);
  };

  return (
    <SimpleMDEditor
      options={options}
      id="editor"
      value={editorValue}
      onChange={handleEditorValue}
    />
  );
}
