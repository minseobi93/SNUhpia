from sqlalchemy import Column, String
from .entity import NoteEntity, Base
from marshmallow import Schema, fields

# Define Note object
class Note(NoteEntity, Base):
  __tablename__ = 'notes'

  subject = Column(String)
  description = Column(String)
  mode = Column(String)

  def __init__(self, subject, description, mode, created_by):
    NoteEntity.__init__(self, created_by)
    self.subject = subject
    self.description = description
    self.mode = mode

# Transform instance of Note into JSON object
class NoteSchema(Schema):
  id = fields.Number()
  subject = fields.Str()
  description = fields.Str()
  mode = fields.Str()
  created_at = fields.DateTime()
  updated_at = fields.DateTime()
  last_updated_by = fields.Str()