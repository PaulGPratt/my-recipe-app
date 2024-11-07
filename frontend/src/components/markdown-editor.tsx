import { FC, useEffect, useRef } from "react";
import { Milkdown, useEditor } from "@milkdown/react";
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";

const defaultContent = ``;

const MarkdownEditor: FC<{
  content: string | null;
  setContent: (text: string) => void;
  isEditable: boolean;
}> = ({ content, setContent, isEditable }) => {
  const editable = useRef(isEditable);
  
  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content || defaultContent);
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          setContent(markdown);
        });
        ctx.update(editorViewOptionsCtx, prev => ({
          ...prev,
          editable: () => editable.current
        }))
      })
      .use(listener)
      .use(commonmark)
      .use(history)
  );

  useEffect(() => {
    editable.current  = isEditable;
  }, [isEditable])

  return <Milkdown />;
};

export default MarkdownEditor;