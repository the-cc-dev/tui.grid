/**
 * @fileoverview 툴바영역 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var classNameConst = require('../../common/classNameConst');

/**
 * 툴바 영역
 * @module view/layout/toolbar
 * @extends module:base/view
 */
var Toolbar = View.extend(/**@lends module:view/layout/toolbar.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.toolbarModel = options.toolbarModel;
        this.dimensionModel = options.dimensionModel;
        this.viewFactory = options.viewFactory;
    },

    className: classNameConst.TOOLBAR,

    /**
     * 랜더링한다.
     * @returns {View.Layout.Toolbar} this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;

        this._destroyChildren();

        if (toolbarModel.get('excelButtons')) {
            this._addChildren(this.viewFactory.createToolbarControlPanel());
        }

        // if (toolbarModel.get('resizeHandle')) {
        //     this._addChildren(this.viewFactory.createToolbarResizeHandler());
        // }

        if (toolbarModel.get('pagination')) {
            this._addChildren(this.viewFactory.createToolbarPagination());
        }

        this.$el.empty().append(this._renderChildren());
        this._refreshHeight();

        return this;
    },

    /**
     * Reset toolbar-height based on the model/dimension->toolbarHeight.
     * @private
     */
    _refreshHeight: function() {
        var height = this.dimensionModel.get('toolbarHeight');

        this.$el.height(height);
        this.$el.toggle(!!height);
    }
});

module.exports = Toolbar;
