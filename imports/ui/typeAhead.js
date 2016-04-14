import { Template } from 'meteor/templating';
import './typeAhead.html';

 
Template.typeAhead.events({
  'input .search'(event) {
    console.debug('search', event);
  },
});