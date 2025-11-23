# ADMIN CRUD Issues

## AdminStudents Page

- **Missing group metadata in `/api/groups/` responses**: the FastAPI groups endpoints currently return objects with `groupId`, `name`, and `size`, but omit the `type` (`"bachelor" | "master"`) and `course` (1-6) fields that the admin UI needs to display and edit groups. POST/PUT payloads also ignore those fields, so any values entered in the UI are lost after a refresh.  
  **Suggested backend change:** extend the group schema to persist and return `type` and `course` fields, e.g.
  
  ```python
  @router.post("/api/groups/", response_model=GroupResponse)
  async def create_group(payload: GroupCreateRequest):
      # payload should include name: str, type: Literal["bachelor", "master"], course: int
      ...
  
  class GroupResponse(BaseModel):
      groupId: str
      name: str
      type: Literal["bachelor", "master"]
      course: int
      size: Optional[int] = None
  ```
  The same shape should be returned by GET `/api/groups/` and PUT `/api/groups/{group_id}` so the frontend can render accurate badges and keep user input.
