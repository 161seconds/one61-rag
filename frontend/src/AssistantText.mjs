import { createElement } from 'react';
import Markdown from 'react-markdown';

export default function AssistantText({ text }) {
  return createElement('div', { className: 'assistant-markdown' }, createElement(Markdown, null, text));
}
