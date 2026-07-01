import { EditorHomePage } from "@/components/editor/editor-home-page"
import { getEditorProjects } from "@/lib/notes"

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getEditorProjects()

  return <EditorHomePage ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
