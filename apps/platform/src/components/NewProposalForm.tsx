"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import TurndownService from "turndown";

function NewProposalForm() {
  const content =
    "<h2>Your proposal's description</h2>It provides context and information about proposal's intent and purpose, which helps users understand what they are voting for or against";

  const [textInputValue, setTextInputValue] = useState("");
  const [richTextEditorValue, setRichTextEditorValue] = useState(content);

  const turndownService = new TurndownService();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Text Input Value:", textInputValue);
    console.log("Rich Text Editor Value:", richTextEditorValue);
    const markdown = turndownService.turndown(richTextEditorValue);
    console.log(markdown);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    ...(content && { richTextEditorValue }),
    onUpdate(props) {
      setRichTextEditorValue(props.editor.getHTML());
    },
  });

  return (
    <div className="w-full flex flex-col gap-7">
      <h1 className="text-lg">Create new proposal</h1>
      <hr></hr>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="proposal-name">Proposal name</Label>
          <Input
            id="proposal-name"
            className="mt-2"
            type="text"
            placeholder="Enter proposal name"
            value={textInputValue}
            onChange={(event) => setTextInputValue(event.target.value)}
            required
          />
        </div>

        <div>
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </div>

        <div className="flex justify-between">
          <Button variant="outline">Return</Button>
          <Button type="submit">Create proposal</Button>
        </div>
      </form>
    </div>
  );
}

export default NewProposalForm;
