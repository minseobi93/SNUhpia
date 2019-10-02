from flask import Flask, jsonify, request
from .notes.entity import Session, engine, Base
from .notes.note import Note, NoteSchema
from flask_cors import CORS

# creating the Flask application
app = Flask(__name__)
CORS(app)

# if needed, generate db schema
Base.metadata.create_all(engine)

#temp_subject = "SQLAlchemy Note"
#temp_description = "I'm writing SQLAlchemy comment."
#temp_user = "Taewon"

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
def add_note():
  # bring note info from HTTP request
  posted_note = NoteSchema(only=('subject', 'description')).load(request.get_json())
  note = Note(**posted_note, created_by="HTTP post request")

  # add note
  session = Session()
  session.add(note)
  session.commit()

  # return created note
  new_note = NoteSchema().dump(note)
  session.close()
  return jsonify(new_note), 201

#if len(notes) == 0:
#  python_note = Note(temp_subject, temp_description, temp_user)
#  session.add(python_note)
#  session.commit()
#  session.close()

  # reload notes
#  notes = session.query(Note).all()

#print('### Notes:')
#for note in notes:
#    print(f'({note.id}) {note.subject} - {note.description}')