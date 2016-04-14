import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './typeAhead.html';

const INITIAL_POS = 0;

Template.typeAhead.onCreated(function() {
  console.log('typeAhead', this.data);

  this.state = new ReactiveDict();
  this.state.setDefault({
    currPos: this.data.currPos || INITIAL_POS,
    suggestions: this.data.suggestions || [],
    showSuggestions: this.data.showSuggestions || false,
    threshold: this.data.threshold || 2,
    limit: this.data.limit || Infinity,
    delay: this.data.delay || 100,
  });
});
 
Template.typeAhead.events({
  'input .search'(event) {
    console.debug('search', event);
  },
});