import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Link,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

type CommandButtonProps = {
  title: string
  command: string
  value?: string
  children: ReactNode
  onRun: (command: string, value?: string) => void
}

function CommandButton({ title, command, value, children, onRun }: CommandButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onRun(command, value)}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<Range | null>(null)

  useEffect(() => {
    const editor = editorRef.current
    if (editor && document.activeElement !== editor && editor.innerHTML !== value) editor.innerHTML = value
  }, [value])

  const saveSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount) return
    const range = selection.getRangeAt(0)
    if (editor.contains(range.commonAncestorContainer)) selectionRef.current = range.cloneRange()
  }

  const restoreSelection = () => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    if (!selectionRef.current || !selection) return
    selection.removeAllRanges()
    selection.addRange(selectionRef.current)
  }

  const emitChange = () => {
    saveSelection()
    onChange(editorRef.current?.innerHTML ?? '')
  }

  const run = (command: string, commandValue?: string) => {
    restoreSelection()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  const setFontSize = (size: string) => {
    restoreSelection()
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount) return

    const range = selection.getRangeAt(0)
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) return

    const content = range.extractContents()
    content.querySelectorAll<HTMLElement>('[style], font[size]').forEach((element) => {
      element.style.removeProperty('font-size')
      element.removeAttribute('size')
      if (!element.getAttribute('style')?.trim()) element.removeAttribute('style')
    })

    const wrapper = document.createElement('span')
    wrapper.style.fontSize = `${size}px`
    wrapper.append(content)
    range.insertNode(wrapper)

    const updatedRange = document.createRange()
    updatedRange.selectNodeContents(wrapper)
    selection.removeAllRanges()
    selection.addRange(updatedRange)
    selectionRef.current = updatedRange.cloneRange()
    onChange(editor.innerHTML)
  }

  const addLink = () => {
    const url = window.prompt('Nhập đường dẫn liên kết')
    if (url) run('createLink', url)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/60 p-2">
        <select
          aria-label="Phông chữ"
          defaultValue="Arial"
          onMouseDown={saveSelection}
          onChange={(event) => run('fontName', event.target.value)}
          className="h-9 max-w-32 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select
          aria-label="Cỡ chữ"
          defaultValue="16"
          onMouseDown={saveSelection}
          onChange={(event) => setFontSize(event.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
        >
          {[12, 14, 16, 18, 20, 24, 28, 32, 36, 40].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <label title="Màu chữ" className="flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-600 hover:bg-blue-50">
          A
          <input
            type="color"
            defaultValue="#334155"
            onMouseDown={saveSelection}
            onChange={(event) => run('foreColor', event.target.value)}
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <CommandButton title="In đậm" command="bold" onRun={run}><Bold size={17} /></CommandButton>
        <CommandButton title="In nghiêng" command="italic" onRun={run}><Italic size={17} /></CommandButton>
        <CommandButton title="Gạch chân" command="underline" onRun={run}><Underline size={17} /></CommandButton>
        <CommandButton title="Căn trái" command="justifyLeft" onRun={run}><AlignLeft size={17} /></CommandButton>
        <CommandButton title="Căn giữa" command="justifyCenter" onRun={run}><AlignCenter size={17} /></CommandButton>
        <CommandButton title="Căn phải" command="justifyRight" onRun={run}><AlignRight size={17} /></CommandButton>
        <CommandButton title="Danh sách dấu chấm" command="insertUnorderedList" onRun={run}><List size={17} /></CommandButton>
        <CommandButton title="Danh sách đánh số" command="insertOrderedList" onRun={run}><ListOrdered size={17} /></CommandButton>
        <button type="button" title="Thêm liên kết" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Link size={17} /></button>
        <CommandButton title="Xóa định dạng" command="removeFormat" onRun={run}><Eraser size={17} /></CommandButton>
        <CommandButton title="Hoàn tác" command="undo" onRun={run}><Undo2 size={17} /></CommandButton>
        <CommandButton title="Làm lại" command="redo" onRun={run}><Redo2 size={17} /></CommandButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder="Nhập nội dung và định dạng như trong Word..."
        className="rich-text-editor min-h-56 px-4 py-4 text-base leading-7 text-slate-700 outline-none"
      />
    </div>
  )
}
