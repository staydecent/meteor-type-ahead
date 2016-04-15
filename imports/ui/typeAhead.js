import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './typeAhead.html';

const INITIAL_POS = 0;
const KEY = {
  UP: 38,
  DOWN: 40,
  ENTER: 13,
  TAB: 9,
  ESC: 27
};
const KEY_VALUES = [
  KEY.UP, 
  KEY.DOWN, 
  KEY.ENTER, 
  KEY.ESC
];

// Initialize our state using any relevant keys in the given data context
Template.typeAhead.onCreated(function() {
  if (!this.data.search) {
    throw new Error('You need to provide a search function');
  }

  this.state = new ReactiveDict();
  this.state.set({
    currPos: this.data.currPos || INITIAL_POS,
    suggestions: this.data.suggestions || [],
    showSuggestions: this.data.showSuggestions || false,
    placeholder: this.data.placeholder || '',
    display: this.data.display || false,
    threshold: this.data.threshold || 2,
    limit: this.data.limit || Infinity,
    delay: this.data.delay || 100,
  });


  this.handleSelect = (item, event) => {
    this.state.set('showSuggestions', false);
    this.state.set('currPos', INITIAL_POS);

    if (this.data.callback) {
      this.data.callback(item);
      event.target.value = '';
    } else {
      let display = this.state.get('display');
      if (display) {
        event.target.value = item[display];
      } else {
        event.target.value = item;
      }
    }
  };
});

// Expose variables and methods to the HTML view
Template.typeAhead.helpers({

  getState(key) {
    return Template.instance().state.get(key);
  },

  visibleClass() {
    return Template.instance().state.get('showSuggestions') && 
           'type-ahead-suggestions-visible';
  },

  activeItemClass(index) {
    return Template.instance().state.get('currPos') === index &&
           'active';
  },

});

// Bind DOM event handlers
Template.typeAhead.events({

  'input .type-ahead-input'(event, instance) {
    let val = event.target.value;
    let state = instance.state;
    let threshold = state.get('threshold');
    let search = instance.data.search;

    if (!val || !val.length || val.length < threshold) {
      return;
    } else {
      Promise.resolve(search(val)).then(function(results) {
        console.debug('search results', results);
        state.set('currPos', INITIAL_POS);
        state.set('suggestions', results);
        state.set('showSuggestions', results.length && val && val.length >= threshold);
      });
    }
  },

  'keydown .type-ahead-input'(event, instance) {
    let val = event.target.value;
    let state = instance.state;
    let max = state.get('suggestions').length -1;
    let currPos = state.get('currPos');

    if (!val || val.length < state.get('threshold')) {
      return;
    }

    if (KEY_VALUES.indexOf(event.keyCode) === -1) {
      return;
    }

    event.preventDefault();

    switch (event.keyCode) {      
      case KEY.UP:
        if (currPos > 0) {
          state.set('currPos', currPos - 1);
        }
        break;
      case KEY.DOWN:
        if (currPos < max || currPos === INITIAL_POS) {
          state.set('currPos', currPos + 1);
        }
        break;
      case KEY.ENTER:
        let selection = state.get('suggestions')[currPos] || val;
        instance.handleSelect(selection, event);
        break;
      case KEY.ESC:
        state.set('showSuggestions', false);
    }
  },

  'blur .type-ahead-input'(event, instance) {
    instance.state.set('showSuggestions', false);
  },

});