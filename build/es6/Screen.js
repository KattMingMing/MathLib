
/* jshint esnext:true */

/* tslint:disable */
var template = function (data) {
    var p = [];
    p.push(' <figure class="MathLib_figure" aria-describedby="MathLib_figcaption_');
    p.push(data.uuid);
    p.push('">     <div class="MathLib_wrapper" style="width: ');
    p.push(data.width);
    p.push('px; height: ');
    p.push(data.height);
    p.push('px" tabindex="0" aria-hidden="true">   <div class="MathLib_info_message">Your browser does not seem to support WebGL.<br>   Please update your browser to see the plot.</div>  </div>      ');
    if (data.figcaption) {
        p.push('   <figcaption class="MathLib_figcaption" id="MathLib_figcaption_');
        p.push(data.uuid);
        p.push('">');
        p.push(data.figcaption);
        p.push('</figcaption>  ');
    }
    p.push('  </figure>  ');
    if (data.contextMenu) {
        p.push('  <div class="MathLib_contextMenuOverlay">   <menu class="MathLib_menu MathLib_mainmenu">          ');
        if (data.contextMenu.screenshot) {
            p.push('     <div class="MathLib_screenshot MathLib_menuItem">Save Screenshot</div>    ');
        }
        p.push('      ');
        if (data.contextMenu.fullscreen) {
            p.push('     <div class="MathLib_fullscreen MathLib_menuItem">      <span class="needs-nofullscreen">Enter Fullscreen</span>      <span class="needs-fullscreen">Exit Fullscreen</span>     </div>    ');
        }
        p.push('      ');
        if (data.contextMenu.grid) {
            p.push('     <div class="MathLib_menuItem MathLib_hasSubmenu">      Grid      <menu class="MathLib_menu MathLib_submenu">       <div class="MathLib_needs2D">        <label class="MathLib_menuItem">         <input type="radio" name="MathLib_grid_type_');
            p.push(data.uuid);
            p.push('" class="MathLib_radio MathLib_grid_type" value="cartesian">cartesian        </label>        <label class="MathLib_menuItem">         <input type="radio" name="MathLib_grid_type_');
            p.push(data.uuid);
            p.push('" class="MathLib_radio MathLib_grid_type" value="polar">polar        </label>        <label class="MathLib_menuItem">         <input type="radio" name="MathLib_grid_type_');
            p.push(data.uuid);
            p.push('" class="MathLib_radio MathLib_grid_type" value="none">none        </label>       </div>        <div class="MathLib_needs3D MathLib_menuItem MathLib_is_disabled" style="font-size: 0.7em">        Gridoptions for 3D are coming soon.       </div>      </menu>     </div>    ');
        }
        p.push('      <hr class="MathLib_separator">    <div class="MathLib_is_disabled MathLib_menuItem MathLib_is_centered" style="font-size:0.83em">     Plot generated by js    </div>   </menu>  </div> ');
    }
    p.push('');
    return p.join('');
};

/* tslint:enable */

import {extendObject} from 'meta';


/**
* This module contains the common methods of all drawing modules.
*
* @class
* @this {Screen}
*/
var Screen = (function () {
    function Screen(id, options) {
        if (typeof options === "undefined") { options = {}; }
        var _this = this;
        this.type = 'screen';
        var that = this, defaults = {
            height: 500,
            width: 500,
            contextMenu: {
                screenshot: true,
                fullscreen: true,
                grid: true
            },
            figcaption: ''
        }, opts = extendObject(defaults, options), container = document.getElementById(id), innerHTMLContextMenu = '', fullscreenchange;

        opts.uuid = +new Date();
        container.innerHTML = template(opts);
        container.className += ' MathLib_container';

        this.height = opts.height;
        this.width = opts.width;
        this.options = opts;
        this.container = container;
        this.figure = container.getElementsByClassName('MathLib_figure')[0];
        this.wrapper = container.getElementsByClassName('MathLib_wrapper')[0];
        this.contextMenu = container.getElementsByClassName('MathLib_mainmenu')[0];
        this.contextMenuOverlay = container.getElementsByClassName('MathLib_contextMenuOverlay')[0];
        this.innerHTMLContextMenu = innerHTMLContextMenu;

        this.wrapper.addEventListener('click', function () {
            return _this.wrapper.focus();
        });

        if (options.contextMenu) {
            this.wrapper.oncontextmenu = function (evt) {
                return _this.oncontextmenu(evt);
            };

            if (opts.contextMenu.screenshot && !('opera' in window)) {
                this.contextMenu.getElementsByClassName('MathLib_screenshot')[0].onclick = function () {
                    var dataURI, a = document.createElement('a');

                    if (that.options.renderer === 'Canvas' && that.type === 'screen2D') {
                        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

                        canvas.height = that.height;
                        canvas.width = that.width;

                        ctx.drawImage(that.layer.back.element, 0, 0);
                        ctx.drawImage(that.layer.grid.element, 0, 0);
                        ctx.drawImage(that.layer.axes.element, 0, 0);
                        ctx.drawImage(that.layer.main.element, 0, 0);

                        dataURI = canvas.toDataURL('image/png');
                        if ('download' in a) {
                            a.href = dataURI;
                            a.download = 'plot.png';
                            a.click();
                        } else {
                            window.location.href = dataURI.replace('image/png', 'image/octet-stream');
                        }
                    }

                    if (that.options.renderer === 'WebGL' && that.type === 'screen3D') {
                        dataURI = that.element.toDataURL('image/png');
                        if ('download' in a) {
                            a.href = dataURI;
                            a.download = 'plot.png';
                            a.click();
                        } else {
                            window.location.href = dataURI.replace('image/png', 'image/octet-stream');
                        }
                    } else if (that.options.renderer === 'SVG') {
                        dataURI = 'data:image/svg+xml,' + that.element.parentElement.innerHTML;

                        if ('download' in a) {
                            a.href = dataURI;
                            a.download = 'plot.svg';
                            a.click();
                        } else {
                            window.location.href = dataURI.replace('image/svg+xml', 'image/octet-stream');
                        }
                    }
                };
            }

            if (opts.contextMenu.fullscreen && 'requestFullScreen' in document.body) {
                this.contextMenu.getElementsByClassName('MathLib_fullscreen')[0].onclick = function () {
                    if (document.fullscreenElement) {
                        document.exitFullScreen();
                    } else {
                        that.container.requestFullScreen();
                    }
                };
            }

            if (opts.contextMenu.grid) {
                this.contextMenu.getElementsByClassName('MathLib_grid_type')[0].onchange = function () {
                    that.options.grid.type = 'cartesian';
                    that.draw();
                };
                this.contextMenu.getElementsByClassName('MathLib_grid_type')[1].onchange = function () {
                    that.options.grid.type = 'polar';
                    that.draw();
                };
                this.contextMenu.getElementsByClassName('MathLib_grid_type')[2].onchange = function () {
                    that.options.grid.type = false;
                    that.draw();
                };
            }
        }

        fullscreenchange = function () {
            if (document.fullscreenElement) {
                that.origWidth = that.width;
                that.origHeight = that.height;
                that.resize(window.outerWidth, window.outerHeight);
            } else {
                that.resize(that.origWidth, that.origHeight);
                delete that.origWidth;
                delete that.origHeight;
            }
        };

        if ('onfullscreenchange' in this.container) {
            this.container.addEventListener('fullscreenchange', fullscreenchange);
        } else if ('onmozfullscreenchange' in this.container) {
            this.container.addEventListener('mozfullscreenchange', fullscreenchange);
        } else if ('onwebkitfullscreenchange' in this.container) {
            this.container.addEventListener('webkitfullscreenchange', fullscreenchange);
        }
    }
    /**
    * Handles the contextmenu event
    *
    * @param {event} evt The event object
    */
    Screen.prototype.oncontextmenu = function (evt) {
        var listener, _this = this, menu = this.contextMenu, overlay = this.contextMenuOverlay;

        if (evt.preventDefault) {
            evt.preventDefault();
        }
        evt.returnValue = false;

        menu.style.setProperty('top', (evt.clientY - 20) + 'px');
        menu.style.setProperty('left', evt.clientX + 'px');
        overlay.style.setProperty('display', 'block');

        listener = function () {
            overlay.style.setProperty('display', 'none');

            Array.prototype.forEach.call(_this.contextMenu.getElementsByClassName('MathLib_temporaryMenuItem'), function (x) {
                _this.contextMenu.removeChild(x);
            });

            overlay.removeEventListener('click', listener);
        };

        overlay.addEventListener('click', listener);
    };
    return Screen;
})();
export default Screen;

