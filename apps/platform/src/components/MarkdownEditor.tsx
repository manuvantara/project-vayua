import { markdownEditorValueAtom } from '@/atoms';
import { Options } from 'easymde';
import 'easymde/dist/easymde.min.css';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';

const SimpleMDEditor = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

const options: Options = {
  autofocus: true,
  placeholder: 'Please Enter Markdown Text',
  spellChecker: false,
  toolbar: [
    'bold',
    'italic',
    'strikethrough',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-smaller',
    'heading-bigger',
    '|',
    'code',
    '|',
    'quote',
    'unordered-list',
    'ordered-list',
    '|',
    'link',
    'image',
    'table',
    'horizontal-rule',
    '|',
    'guide',
  ],
};

export default function MarkdownEditor() {
  const [editorValue, setEditorValue] = useAtom(markdownEditorValueAtom);

  const handleEditorValue = (value: string) => {
    setEditorValue(value);
  };

  return (
    <SimpleMDEditor
      id="editor"
      onChange={handleEditorValue}
      options={options}
      value={editorValue}
    />
  );
}
