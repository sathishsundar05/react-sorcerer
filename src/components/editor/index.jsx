import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "./editor.css";

const MyEditor = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editor = useRef(null);
  const styleMap = {
    "COLOR-RED": {
      color: "red",
    },
  };

  useEffect(() => {
    const savedContent = localStorage.getItem("draftEditorContent");

    if (savedContent) {
      // If content exists in localStorage, convert it to EditorState
      const contentState = convertFromRaw(JSON.parse(savedContent));
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, []);

  const saveEditorData = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("draftEditorContent", contentStateJSON);
  };

  useImperativeHandle(ref, () => ({
    saveEditorData,
  }));

  const focusEditor = () => {
    editor.current.focus();
  };

  const handleChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const selection = newEditorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const block = contentState.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();
    const currentBlockText = currentBlock?.getText();

    if (blockText.startsWith("# ") && selection.getStartOffset() === 2) {
      // If the block starts with '# ' and space is pressed, convert to Heading 1
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "header-one"
      );

      // Remove the '# ' from the current block text
      const updatedBlockText =
        currentBlockText.slice(0, selection.getStartOffset() - 2) +
        currentBlockText.slice(selection.getStartOffset());

      const updatedContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: selection.getStartOffset(),
        }),
        updatedBlockText
      );

      setEditorState(
        EditorState.push(editorState, updatedContentState, "change-block-type")
      );
    } else if (blockText.startsWith("* ") && selection.getStartOffset() === 2) {
      // If the block starts with '* ' and space is pressed, apply bold format
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "bold-type"
      );

      // Remove the '* ' from the current block text
      const updatedContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: selection.getStartOffset() + 1,
        }),
        blockText.slice(2),
        currentBlock.getInlineStyleAt(0).add("BOLD")
      );

      const newEditorStateWithBold = EditorState.push(
        newEditorState,
        updatedContentState,
        "apply-bold-text"
      );

      setEditorState(
        RichUtils.toggleInlineStyle(newEditorStateWithBold, "BOLD")
      );
    } else if (
      blockText.startsWith("** ") &&
      selection.getStartOffset() === 3
    ) {
      // If the block starts with '** ' and space is pressed, apply red color
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "color-type"
      );

      // Remove the '** ' from the current block text
      const updatedContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: selection.getStartOffset() + 2,
        }),
        blockText.slice(3),
        currentBlock.getInlineStyleAt(0).add("COLOR-RED")
      );

      const newEditorStateWithColor = EditorState.push(
        newEditorState,
        updatedContentState,
        "apply-red-text"
      );

      setEditorState(
        RichUtils.toggleInlineStyle(newEditorStateWithColor, "COLOR-RED")
      );
    } else if (
      blockText.startsWith("*** ") &&
      selection.getStartOffset() === 4
    ) {
      // If the block starts with '*** ' and space is pressed, apply underline
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "underline-type"
      );

      // Remove the '*** ' from the current block text
      const updatedContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: selection.getStartOffset() + 3,
        }),
        blockText.slice(3)
      );

      const newEditorStateWithBold = EditorState.push(
        newEditorState,
        updatedContentState,
        "apply-underline-text"
      );

      setEditorState(
        RichUtils.toggleInlineStyle(newEditorStateWithBold, "UNDERLINE")
      );
    } else if (
      blockText.startsWith("``` ") &&
      selection.getStartOffset() === 4
    ) {
      // If the block starts with '``` ' and space is pressed, apply HIGHLIGHT style
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "code-block"
      );

      // Remove the '``` ' from the current block text
      const updatedBlockText =
        currentBlockText.slice(0, selection.getStartOffset() - 4) +
        currentBlockText.slice(selection.getStartOffset());

      const updatedContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: selection.getStartOffset(),
        }),
        updatedBlockText
      );

      setEditorState(
        EditorState.push(editorState, updatedContentState, "change-block-type")
      );
    } else {
      if (blockText.length === 0) {
        // If an empty block is entered, set the block type to 'unstyled'
        const newContentState = Modifier.setBlockType(
          contentState,
          selection,
          "empty"
        );

        setEditorState(
          EditorState.push(newEditorState, newContentState, "change-block-type")
        );
      } else {
        // For other cases, simply set the new editor state
        setEditorState(newEditorState);
      }
    }
  };

  const handleReturn = (command) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    if (command.keyCode === 13) {
      const newContentState = Modifier.splitBlock(currentContent, selection);

      const contentWithUnstyled = Modifier.setBlockType(
        newContentState,
        newContentState.getSelectionAfter(),
        "unstyled"
      );
      setEditorState(
        EditorState.push(editorState, contentWithUnstyled, "split-block")
      );
    }
  };

  const myBlockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === "header-one") {
      return "heading-el";
    } else if (type === "bold-type") {
      return "bold-el";
    } else if (type === "color-type") {
      return "color-el";
    } else if (type === "underline-type") {
      return "underline-el";
    } else if (type === "unstyled") {
      return "remove-styles";
    } else if (type === "code-block") {
      return "code-block-styles";
    } else {
      return "remove-styles";
    }
  };

  return (
    <div className="draft-editor" onClick={focusEditor}>
      <Editor
        ref={editor}
        customStyleMap={styleMap}
        editorState={editorState}
        onChange={handleChange}
        handleReturn={handleReturn}
        blockStyleFn={myBlockStyleFn}
      />
    </div>
  );
});

export default MyEditor;
