import { FC, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditorWrapper: FC<{
    content: string | null;
    setContent: (text: string) => void;
    isEditMode: boolean;
}> = ({ content, setContent, isEditMode }) => {

    const editable = useRef(isEditMode);

    const defaultContent = ``;

    const modules = useMemo(() => {
        return editable
            ? {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                ],
            }
            : { toolbar: false };
    }, [isEditMode]);

    return (
        <ReactQuill
            key={isEditMode ? 'edit-mode' : 'read-only'} // Force rerender on mode change
            defaultValue={content || defaultContent} // Use defaultValue for initial content
            onChange={setContent}
            readOnly={!isEditMode} // Toggle read-only mode
            modules={modules} // Toggle modules based on edit mode
            theme="snow"
        />
    );
};

export default QuillEditorWrapper;