export default function(Chart) {


  var syncPlugin = {

    syncGroups: {},

		getXScale: function(chart) {
			return chart.data.datasets.length ? chart.scales[chart.getDatasetMeta(0).xAxisID] : null;
		},

    afterInit: function(chart) {
      chart.sync = {
        blockNextTooltip: false,
        group: 'a'
      }
      this.subscribe(chart.sync.group,chart)
    },

    destroy: function(chart) {
      this.unsubscribe(chart)
    },

    afterEvent: function(chart, e) {
      // sync!
      var xScale = this.getXScale(chart)

      if(!e.halt) {
        e.halt = true
        e.xvalue = xScale.getValueForPixel(e.x),
        this.publish(chart, chart.sync.group, e)
      }
    },

    publish: function(chart, group, e) {
      for(var index in this.syncGroups[group]) {
        var chrt = this.syncGroups[group][index]
        if(chart == chrt) {
          continue
        }
        this.receive(chrt, e)
      }
    },

    receive: function(chart, e) {

      var xScale = this.getXScale(chart)

      var newEvent = {
        type: e.type,
        chart: chart,
        x: xScale.getPixelForValue(e.xvalue),
        y: e.y,
        native: {
          buttons: 0
        },
        halt: true
      }

      chart.sync.blockNextTooltip = true

      chart.controller.eventHandler(newEvent)
    },

    beforeTooltipDraw: function(chart) {
      if (chart.sync.blockNextTooltip) {
        chart.sync.blockNextTooltip = false
        return false
      }
      return true
    },

    subscribe: function(group, chart) {
      if(this.syncGroups[group]) {
        this.syncGroups[group].push(chart)
      } else {
        this.syncGroups[group] = [chart]
      }
    },
    unsubscribe: function(chart) {
      const index = this.syncGroups[chart.sync.group].indexOf(chart)
      if (index > -1) {
        console.log('unsubscribe')
        this.syncGroups[chart.sync.group].splice(index, 1)
      }

    }
  }

	Chart.plugins.register(syncPlugin);
}