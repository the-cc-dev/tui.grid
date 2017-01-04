'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');
var Focus = require('model/focus');
var CoordRow = require('model/coordRow');
var CoordColumn = require('model/coordColumn');
var SmartRenderer = require('model/renderer-smart');
var DomState = require('domState');
var dimensionConst = require('common/constMap').dimension;

var BUFFER_RATIO = SmartRenderer.BUFFER_RATIO;
var BUFFER_HIT_RATIO = SmartRenderer.BUFFER_HIT_RATIO;
var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

describe('model.renderer', function() {
    var renderer;

    function create() {
        var columnModel = new ColumnModelData({
            columnModelList: [
                {columnName: 'c1'},
                {columnName: 'c2'},
                {columnName: 'c3'}
            ]
        });
        var dataModel = new RowListData([], {
            columnModel: columnModel
        });
        var dimensionModel = new Dimension({
            headerHeight: 0,
            scrollX: false,
            isFixedHeight: true
        }, {
            dataModel: dataModel,
            columnModel: columnModel
        });
        var coordRowModel = new CoordRow(null, {
            dataModel: dataModel,
            dimensionModel: dimensionModel
        });
        var coordColumnModel = new CoordColumn(null, {
            columnModel: columnModel,
            dimensionModel: dimensionModel
        });
        var focusModel = new Focus(null, {
            domState: new DomState($('<div />')),
            columnModel: columnModel,
            dataModel: dataModel,
            dimensionModel: dimensionModel
        });

        return new SmartRenderer(null, {
            dataModel: dataModel,
            columnModel: columnModel,
            dimensionModel: dimensionModel,
            focusModel: focusModel,
            coordRowModel: coordRowModel,
            coordColumnModel: coordColumnModel
        });
    }

    function setSampleRows() {
        var rowList = [], i;
        for (i = 0; i < 50; i += 1) {
            rowList.push({
                c1: '1',
                c2: '2',
                c3: '3'
            });
        }
        renderer.dataModel.setRowList(rowList);
    }

    describe('_setRenderingRange()', function() {
        var rowHeight = 10;
        var bodyHeight = 100;
        var bufferSize = parseInt(bodyHeight * BUFFER_RATIO, 10);
        var bufferRowCount = parseInt(bufferSize / 10, 10);

        beforeEach(function() {
            renderer = create();
            renderer.dimensionModel.set({
                bodyHeight: bodyHeight,
                rowHeight: rowHeight - CELL_BORDER_WIDTH
            });
            setSampleRows();
            renderer.refresh();
        });

        it('when scrollTop = 0', function() {
            renderer._setRenderingRange(0);
            expect(renderer.get('top')).toBe(0);
            expect(renderer.get('startIndex')).toBe(0);
            expect(renderer.get('endIndex')).toBe(10 + bufferRowCount);
        });

        it('when scrollTop = 100', function() {
            renderer._setRenderingRange(100);
            expect(renderer.get('top')).toBe(100 - bufferSize);
            expect(renderer.get('startIndex')).toBe(10 - bufferRowCount);
            expect(renderer.get('endIndex')).toBe(20 + bufferRowCount);
        });

        it('when scrollTop is max value', function() {
            var maxScrollTop = renderer.get('maxScrollTop');
            renderer._setRenderingRange(maxScrollTop);
            expect(renderer.get('top')).toBe(maxScrollTop - bufferSize);
            expect(renderer.get('startIndex')).toBe(40 - bufferRowCount);
            expect(renderer.get('endIndex')).toBe(49);
        });
    });

    describe('_shouldRefresh()', function() {
        var rowHeight = 10;
        var bodyHeight = 100;
        var bufferHitSize = parseInt(bodyHeight * BUFFER_HIT_RATIO, 10);

        beforeEach(function() {
            renderer = create();
            renderer.dimensionModel.set({
                bodyHeight: bodyHeight,
                rowHeight: rowHeight - CELL_BORDER_WIDTH
            });
            setSampleRows();
            renderer.refresh();
        });

        it('when top : 0', function() {
            var limitBottom = renderer.get('bottom') - bodyHeight - bufferHitSize;

            expect(renderer._shouldRefresh(0)).toBe(false);
            expect(renderer._shouldRefresh(limitBottom)).toBe(false);
            expect(renderer._shouldRefresh(limitBottom + 1)).toBe(true);
        });

        it('when scrollTop = 100', function() {
            var limitTop, limitBottom;

            renderer._setRenderingRange(100);
            limitTop = renderer.get('top') + bufferHitSize;
            limitBottom = renderer.get('bottom') - bodyHeight - bufferHitSize;

            expect(renderer._shouldRefresh(limitTop - 1)).toBe(true);
            expect(renderer._shouldRefresh(limitTop)).toBe(false);
            expect(renderer._shouldRefresh(limitBottom)).toBe(false);
            expect(renderer._shouldRefresh(limitBottom + 1)).toBe(true);
        });

        it('when scrollTop is max value', function() {
            var maxScrollTop = renderer.get('maxScrollTop');
            var limitTop;

            renderer._setRenderingRange(maxScrollTop);
            limitTop = renderer.get('top') + bufferHitSize;

            expect(renderer._shouldRefresh(limitTop - 1)).toBe(true);
            expect(renderer._shouldRefresh(limitTop)).toBe(false);
            expect(renderer._shouldRefresh(maxScrollTop)).toBe(false);
        });
    });

    describe('When dimension.bodyHeight is changed', function() {
        var proto;

        beforeEach(function() {
            proto = SmartRenderer.prototype;
            spyOn(proto, 'refresh');
            renderer = create();
        });

        it('refresh() method should be called', function() {
            renderer.dimensionModel.set('bodyHeight', 200);
            expect(proto.refresh).toHaveBeenCalled();
        });
    });

    describe('When scrollTop is changed', function() {
        var proto;

        beforeEach(function() {
            renderer = create();
            proto = renderer.constructor.prototype;
            spyOn(proto, 'refresh');
        });

        it('refresh() method should be called if _shouldRefresh return true', function() {
            spyOn(proto, '_shouldRefresh').and.returnValue(true);
            renderer.set('scrollTop', 100);
            expect(proto.refresh).toHaveBeenCalled();
        });

        it('refresh() method should not be called if _shouldRefresh return false', function() {
            spyOn(proto, '_shouldRefresh').and.returnValue(false);
            renderer.set('scrollTop', 100);
            expect(proto.refresh).not.toHaveBeenCalled();
        });
    });
});