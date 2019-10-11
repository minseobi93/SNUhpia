from flask import Flask, jsonify, request
from .notes.entity import Session, engine, Base
from .notes.note import Note, NoteSchema
from flask_cors import CORS

# creating the Flask application
app = Flask(__name__)
app.config['debug'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
CORS(app)

# if needed, generate db schema
Base.metadata.create_all(engine)

@app.route('/notes')
def get_notes():
  # fetching from db
  session = Session()
  notes_objects = session.query(Note).all()

  # transforming into JSON-serializable objects
  schema = NoteSchema(many=True)
  notes = schema.dump(notes_objects)

  session.close()
  return jsonify(notes)

@app.route('/notes', methods=['POST'])
def post_note():
  # bring note info from HTTP request
  posted_note = request.get_json()
  if posted_note['mode'] == 'add':
    return add_note(posted_note)

  elif posted_note['mode'] == 'revise':
    return revise_note(posted_note)

  elif posted_note['mode'] == 'delete':
    return delete_note(posted_note)

def add_note(posted_note):
  posted_note = NoteSchema(only=('subject', 'description', 'mode')).load(request.get_json())
  note = Note(**posted_note, created_by="HTTP post request")
  # add note
  session = Session()
  session.add(note)
  session.commit()
  # return created note
  new_note = NoteSchema().dump(note)
  session.close()
  return jsonify(new_note), 201

def revise_note(posted_note):
  session = Session()
  note_to_revise = session.query(Note).get(posted_note['id'])
  note_to_revise.subject = posted_note['subject']
  note_to_revise.description = posted_note['description']
  session.commit()
  revised_note = NoteSchema().dump(note_to_revise)
  session.close()
  return jsonify(revised_note), 201

def delete_note(posted_note):
  session = Session()
  note_to_delete = session.query(Note).get(posted_note['id'])
  session.delete(note_to_delete)
  session.commit()
  deleted_note = NoteSchema().dump(note_to_delete)
  session.close()
  return jsonify(deleted_note), 201