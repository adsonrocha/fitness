'use client'

import { useEffect, useState, useRef } from "react"
import { Button } from "./ui/button"
import { useActionState } from "react"

async function processTxtToJson(state: { error?: string, json?: any }, formData: FormData) {
  const filename = formData.get("txtfile")
  if (!filename) return { error: "Selecione um arquivo." }

  const res = await fetch("/api/txtToJson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  })
  if (!res.ok) return { error: "Erro ao processar o arquivo." }
  const data = await res.json()
  return { json: data.json }
}

export default function TxtToJsonComponent() {
  const [files, setFiles] = useState<string[]>([])
  const [json, setJson] = useState<any>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const [state, formAction] = useActionState(processTxtToJson, { error: undefined, json: undefined })

  useEffect(() => {
    fetch("/api/txtToJson")
      .then(res => res.json())
      .then(data => setFiles(data.files))
  }, [])

  // Atualiza o json exibido quando o estado muda
  useEffect(() => {
    if (state?.json) setJson(state.json)
  }, [state])

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="flex flex-col gap-4">
        <form action={formAction}>
          <select name="txtfile" ref={selectRef} defaultValue="">
            <option value="">Selecione um arquivo</option>
            {files.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Button type="submit" disabled={files.length === 0}>Processar</Button>
        </form>
        {state?.error && <div className="text-red-500">{state.error}</div>}
        <pre>{json && JSON.stringify(json, null, 2)}</pre>
      </div>
    </div>
  )
}