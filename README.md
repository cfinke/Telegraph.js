Telegraph.js is a JavaScript library that enables Morse code input on text fields via mouse clicks (or finger taps on touchscreens).

Usage
=====

To use Telegraph, simply pass the input element to the ```telegraph``` function:

```javascript
Telegraph.start(element);
```

To stop Telegraph,

```javascript
Telegraph.stop(element);
```

There are optional configuration parameters you can pass as part of the second argument:

```javascript
Telegraph.start(element, { wpm : 20 });
```

```wpm``` sets the baseline speed for interpreting your Morse code.

Licensing
=========

Telegraph.js is free software, licensed under the Modified BSD License.