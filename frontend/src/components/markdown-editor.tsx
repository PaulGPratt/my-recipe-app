import { FC } from "react";
import { Milkdown, useEditor } from "@milkdown/react";
import { defaultValueCtx, Editor, rootCtx } from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";

const defaultContent = `
- 
`;

const MarkdownEditor: FC<{
  content: string | null;
  setContent: (text: string) => void;
}> = ({ content, setContent }) => {
  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content || defaultContent);
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          setContent(markdown);
        });
      })
      .use(listener)
      .use(commonmark)
      .use(history)
  );

  return <Milkdown />;
};

export default MarkdownEditor;