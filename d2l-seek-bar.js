/**
`d2l-seek-bar`
Polymer-based web component for a D2L seek-bar
@demo demo/index.html
*/
import '@polymer/polymer/polymer-legacy.js';

import { IronRangeBehavior } from '@polymer/iron-range-behavior/iron-range-behavior.js';
import 'd2l-colors/d2l-colors.js';
import './d2l-progress.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-seek-bar">
	<template strip-whitespace="">
		<style>
			:host {
				@apply --layout;
				@apply --layout-justified;
				@apply --layout-center;
				display: block;
				--calculated-d2l-seek-bar-height: var(--d2l-seek-bar-height, 4px);
				--calculated-d2l-knob-size: var(--d2l-knob-size, 32px);
				--half-knob-size: calc(var(--calculated-d2l-knob-size)/2);
				--half-knob-size-overflow: calc((var(--calculated-d2l-knob-size) - var(--calculated-d2l-seek-bar-height)) / 2 - 1px);
				--calculated-inner-knob-margin: var(--d2l-inner-knob-margin, 9px);
				--calculated-d2l-knob-box-shadow: var(--d2l-knob-box-shadow, none);
				--calculated-d2l-outer-knob-color: var(--d2l-outer-knob-color, var(--d2l-color-regolith));
				--calculated-d2l-outer-knob-border-color: var(--d2l-outer-knob-border-color, var(--d2l-color-pressicus));
				--calculated-d2l-inner-knob-color: var(--d2l-inner-knob-color, var(--d2l-color-celestine));
				--calculated-d2l-progress-border-color: var(--d2l-progress-border-color, var(--d2l-color-pressicus));
				--calculated-d2l-progress-shadow-color: var(--d2l-progress-shadow-color, #dadee3);
				--calculated-d2l-progress-background-color: var(--d2l-progress-background-color, var(--d2l-color-gypsum));
			}

			#sliderContainer {
				position: relative;
				height: var(--calculated-d2l-knob-size);
				margin-left: var(--half-knob-size);
				margin-right: var(--half-knob-size);
			}

			.bar-container {
				@apply --layout-fit;
				overflow: hidden;
				cursor: pointer;
			}

			#sliderBar {
				padding: var(--half-knob-size-overflow) 0;
				width: 100%;
				--d2l-progress-primary: {
					border-radius: 4px;
				}
				--d2l-progress-container: {
					border: 1px solid var(--calculated-d2l-progress-border-color);
					border-radius: 4px;
					box-shadow: inset 0 1px 0 0 var(--calculated-d2l-progress-shadow-color);
				}
				--d2l-progress-container-color: var(--calculated-d2l-progress-background-color);
				--d2l-progress-active-color: transparent;
			}

			.slider-knob {
				position: absolute;
				left: 0;
				top: 0;
				margin-left: calc(-1 * ((var(--calculated-d2l-knob-size) / 2) - var(--calculated-d2l-seek-bar-height) / 2) - var(--calculated-d2l-seek-bar-height) / 2);
				width: calc((((var(--calculated-d2l-knob-size) / 2) - var(--calculated-d2l-seek-bar-height) / 2) * 2) + var(--calculated-d2l-seek-bar-height) - 2px);
				height: calc((((var(--calculated-d2l-knob-size) / 2) - var(--calculated-d2l-seek-bar-height) / 2) * 2) + var(--calculated-d2l-seek-bar-height) - 2px);
				background-color: var(--calculated-d2l-outer-knob-color);
				border: 1px solid var(--calculated-d2l-outer-knob-border-color);
				box-shadow: var(--calculated-d2l-knob-box-shadow);
				border-radius: 50%;
				cursor: pointer;
			}

			.slider-knob-inner {
				margin: var(--calculated-inner-knob-margin);
				width: calc(100% - var(--calculated-inner-knob-margin)*2);
				height: calc(100% - var(--calculated-inner-knob-margin)*2);
				background-color: var(--calculated-d2l-inner-knob-color);
				border: 2px solid var(--calculated-d2l-inner-knob-color);
				border-radius: 50%;
				box-sizing: border-box;
			}

		</style>

		<div id="sliderContainer">
			<div class="bar-container">
				<d2l-progress id="sliderBar" value="{{immediateValue}}" on-down="_barDown" on-up="_barUp" on-track="_onTrack"></d2l-progress>
			</div>
			<div id="sliderKnob" class="slider-knob" on-down="_knobDown" on-track="_onTrack">
				<div class="slider-knob-inner"></div>
			</div>
		</div>
	</template>

</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
	is: 'd2l-seek-bar',

	behaviors: [
		IronRangeBehavior
	],

	properties: {
		immediateValue: {
			type: Number,
			value: 0,
			readOnly: true,
			notify: true
		},

		dragging: {
			type: Boolean,
			value: false,
			readOnly: true,
			notify: true
		},

		vertical: {
			type: Boolean,
			value: false
		}
	},

	observers: [
		'_updateKnob(value, min, max)',
		'_immediateValueChanged(immediateValue)',
		'_draggingChanged(dragging)'
	],

	_update: function() {
		this._setRatio(this._calcRatio(this.value));
	},

	_updateKnob: function(value) {
		this._positionKnob(this._calcRatio(value));
	},

	_immediateValueChanged: function() {
		if (!this.dragging) {
			this.value = this.immediateValue;
		}
	},

	_draggingChanged: function() {
		if (this.dragging) {
			this.dispatchEvent(new CustomEvent('drag-start', { bubbles: true, composed: true }));
		} else {
			this.dispatchEvent(new CustomEvent('drag-end', { bubbles: true, composed: true }));
		}
	},

	_positionKnob: function(ratio) {
		this._setImmediateValue(this._calcStep(this._calcKnobPosition(ratio)));
		this._setRatio(this._calcRatio(this.immediateValue));

		this.$.sliderKnob.style.left = (this.ratio * 100) + '%';
		if (this.dragging) {
			this._knobstartx = this.ratio * this._w;
			this.translate3d(0, 0, 0, this.$.sliderKnob);
		}
	},

	_knobDown: function(event) {
		event.preventDefault();
		this.focus();
	},

	_onTrack: function(event) {
		event.stopPropagation();

		switch (event.detail.state) {
			case 'start':
				this._trackStart(event);
				break;
			case 'track':
				this._track(event);
				break;
			case 'end':
				this._trackEnd();
				break;
		}
	},

	_trackStart: function() {
		this._w = this.$.sliderBar.offsetWidth;
		this._x = this.ratio * this._w;
		this._startx = this._x;
		this._knobstartx = this._startx;
		this._minx = -this._startx;
		this._maxx = this._w - this._startx;
		this._setDragging(true);
	},

	_track: function(event) {
		if (!this.dragging) {
			this._trackStart(event);
		}

		var mousePosition = this.vertical ? -event.detail.dy : event.detail.dx;
		var dx = Math.min(this._maxx, Math.max(this._minx, mousePosition));
		this._x = this._startx + dx;

		var immediateValue = this._calcStep(this._calcKnobPosition(this._x / this._w));
		this._setImmediateValue(immediateValue);

		var translateX = ((this._calcRatio(this.immediateValue) * this._w) - this._knobstartx);
		this.translate3d(translateX + 'px', 0, 0, this.$.sliderKnob);
	},

	_trackEnd: function() {
		var s = this.$.sliderKnob.style;

		this._setDragging(false);
		this.value = this.immediateValue;

		s.transform = s.webkitTransform = '';
	},

	_barDown: function(event) {
		this._w = this.$.sliderBar.offsetWidth;
		var rect = this.$.sliderBar.getBoundingClientRect();

		var mousePosition = this.vertical ? rect.bottom - event.detail.y : event.detail.x - rect.left;
		var ratio = mousePosition / this._w;

		this._setDragging(true);
		this._positionKnob(ratio);

		event.preventDefault();
		this.focus();
	},

	_barUp: function() {
		this._setDragging(false);
	},

	_calcKnobPosition: function(ratio) {
		return (this.max - this.min) * ratio + this.min;
	}
});
