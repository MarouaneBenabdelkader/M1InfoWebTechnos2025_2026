/**
 * TrimbarsDrawer - Interactive trim bars for sample editing
 * 
 * This class handles:
 * - Drawing trim bars on canvas overlay
 * - Mouse interaction (drag, select)
 * - Visual feedback for trim positions
 * 
 * Reused and adapted from Exercise 3
 */

import { distance } from './utils.js';

export default class TrimbarsDrawer {
    constructor(canvas, leftTrimBarX = 100, rightTrimBarX = 700) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Left trim bar state
        this.leftTrimBar = {
            x: leftTrimBarX,
            color: "white",
            selected: false,
            dragged: false
        };
        
        // Right trim bar state
        this.rightTrimBar = {
            x: rightTrimBarX,
            color: "white",
            selected: false,
            dragged: false
        };
        
        this.minDistance = 20; // Minimum distance between trim bars
    }

    /**
     * Clear the overlay canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw both trim bars on the canvas
     */
    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Clear previous drawing
        this.clear();

        const height = this.canvas.height;

        // Draw left trim bar
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.leftTrimBar.selected ? 'red' : this.leftTrimBar.color;
        ctx.beginPath();
        ctx.moveTo(this.leftTrimBar.x, 0);
        ctx.lineTo(this.leftTrimBar.x, height);
        ctx.stroke();

        // Draw left triangle (handle)
        ctx.fillStyle = this.leftTrimBar.selected ? 'red' : this.leftTrimBar.color;
        ctx.beginPath();
        ctx.moveTo(this.leftTrimBar.x, 0);
        ctx.lineTo(this.leftTrimBar.x - 10, 15);
        ctx.lineTo(this.leftTrimBar.x + 10, 15);
        ctx.closePath();
        ctx.fill();

        // Draw right trim bar
        ctx.strokeStyle = this.rightTrimBar.selected ? 'red' : this.rightTrimBar.color;
        ctx.beginPath();
        ctx.moveTo(this.rightTrimBar.x, 0);
        ctx.lineTo(this.rightTrimBar.x, height);
        ctx.stroke();

        // Draw right triangle (handle)
        ctx.fillStyle = this.rightTrimBar.selected ? 'red' : this.rightTrimBar.color;
        ctx.beginPath();
        ctx.moveTo(this.rightTrimBar.x, 0);
        ctx.lineTo(this.rightTrimBar.x - 10, 15);
        ctx.lineTo(this.rightTrimBar.x + 10, 15);
        ctx.closePath();
        ctx.fill();

        // Draw semi-transparent overlay outside trim region
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        
        // Left overlay (before left trim bar)
        ctx.fillRect(0, 0, this.leftTrimBar.x, height);
        
        // Right overlay (after right trim bar)
        ctx.fillRect(this.rightTrimBar.x, 0, this.canvas.width - this.rightTrimBar.x, height);

        ctx.restore();
    }

    /**
     * Check if mouse is near a trim bar
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {number} threshold - Distance threshold for selection
     * @returns {string|null} 'left', 'right', or null
     */
    isNearTrimBar(x, y, threshold = 15) {
        const distToLeft = distance(x, y, this.leftTrimBar.x, 7.5);
        const distToRight = distance(x, y, this.rightTrimBar.x, 7.5);
        
        if (distToLeft < threshold) {
            return 'left';
        }
        if (distToRight < threshold) {
            return 'right';
        }
        return null;
    }

    /**
     * Handle mouse down event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} True if a trim bar was selected
     */
    onMouseDown(x, y) {
        const near = this.isNearTrimBar(x, y);
        
        if (near === 'left') {
            this.leftTrimBar.selected = true;
            this.leftTrimBar.dragged = true;
            this.rightTrimBar.selected = false;
            return true;
        } else if (near === 'right') {
            this.rightTrimBar.selected = true;
            this.rightTrimBar.dragged = true;
            this.leftTrimBar.selected = false;
            return true;
        }
        
        // Deselect both if clicked elsewhere
        this.leftTrimBar.selected = false;
        this.rightTrimBar.selected = false;
        
        return false;
    }

    /**
     * Handle mouse move event (dragging)
     * @param {number} x - Mouse X position
     * @returns {boolean} True if a trim bar was moved
     */
    onMouseMove(x) {
        let moved = false;
        
        if (this.leftTrimBar.dragged) {
            // Constrain left bar position
            const minX = 0;
            const maxX = this.rightTrimBar.x - this.minDistance;
            this.leftTrimBar.x = Math.max(minX, Math.min(maxX, x));
            moved = true;
        }
        
        if (this.rightTrimBar.dragged) {
            // Constrain right bar position
            const minX = this.leftTrimBar.x + this.minDistance;
            const maxX = this.canvas.width;
            this.rightTrimBar.x = Math.max(minX, Math.min(maxX, x));
            moved = true;
        }
        
        if (moved) {
            this.draw();
        }
        
        return moved;
    }

    /**
     * Handle mouse up event
     */
    onMouseUp() {
        this.leftTrimBar.dragged = false;
        this.rightTrimBar.dragged = false;
        this.draw();
    }

    /**
     * Get normalized trim positions (0-1 range)
     * @returns {{start: number, end: number}} Normalized positions
     */
    getNormalizedPositions() {
        const width = this.canvas.width;
        return {
            start: this.leftTrimBar.x / width,
            end: this.rightTrimBar.x / width
        };
    }

    /**
     * Set trim positions from normalized values (0-1 range)
     * @param {number} start - Start position (0-1)
     * @param {number} end - End position (0-1)
     */
    setNormalizedPositions(start, end) {
        const width = this.canvas.width;
        this.leftTrimBar.x = start * width;
        this.rightTrimBar.x = end * width;
        this.draw();
    }

    /**
     * Reset trim bars to default positions
     * @param {number} leftX - Left bar X position
     * @param {number} rightX - Right bar X position
     */
    reset(leftX, rightX) {
        this.leftTrimBar.x = leftX;
        this.rightTrimBar.x = rightX;
        this.leftTrimBar.selected = false;
        this.rightTrimBar.selected = false;
        this.leftTrimBar.dragged = false;
        this.rightTrimBar.dragged = false;
        this.draw();
    }

    /**
     * Get pixel positions of trim bars
     * @returns {{left: number, right: number}} Pixel positions
     */
    getPositions() {
        return {
            left: this.leftTrimBar.x,
            right: this.rightTrimBar.x
        };
    }

    /**
     * Check if currently dragging a trim bar
     * @returns {boolean} True if dragging
     */
    isDragging() {
        return this.leftTrimBar.dragged || this.rightTrimBar.dragged;
    }
}
