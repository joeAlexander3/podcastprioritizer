import React from 'react';
import TextInput from './TextInput';

const InputForm = ({handleTextChange, handleSubmit, userInputFrom, userInputTo, podcastInput}) =>
  <form>
    <section className="travelDetails">
      <h2><i className="fas fa-map-marker-alt" aria-label="Icon of a location pin"></i> Type in your travel details</h2>
      
      <div className="startingPoint">
        <TextInput
          inputFor="userInputFrom"
          label="Starting Point:"
          handleTextChange={handleTextChange}
          placeholder="12 Bloor Street Toronto"
          inputState={userInputFrom}
        />
      </div>

      <div className="destination">
        <TextInput
          inputFor="userInputTo"
          label="Destination:"
          handleTextChange={handleTextChange}
          placeholder="11 Yonge Street Toronto"
          inputState={userInputTo}
        />
      </div>
    </section>

    <section className="podcastDetails">
      <div className="podcastSearch">
        <h2><i className="fas fa-podcast" aria-label="Icon of a microphone"></i> Type in your podcast details</h2>

        {/* Podcast text search */}
        <TextInput
          inputFor="podcastInput"
          label="Podcast Search:"
          handleTextChange={handleTextChange}
          placeholder="ex: genre, title, creator"
          inputState={podcastInput}
        />
      </div>
    </section>

    <button
      className="formButton"
      onClick={(event) => {
        event.preventDefault();
        handleSubmit(event, userInputFrom, userInputTo, podcastInput);
      }}
    >
      FIND SUGGESTIONS
    </button>
  </form>

  export default InputForm;