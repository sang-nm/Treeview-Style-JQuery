jQuery.fn.extend({
	treetable: function () {
		var $table = $(this);
		$table.addClass("tt-table");

		var $items = $table.find("div.tt");
		var index = {};
		var items = [];

		// add items to index
		$items.each(function (i, el) {
			var $el = $(el);
			var id = $el.data('tt-id');
			var parent = $el.data('tt-parent');
			if (parent === '') {
				parent = undefined;
			}

			var item = {
				id: id,
				parent: parent,
				children: [],
				el: $el,
				left: 0,
				width: $el.width() + 12,
				lastChild: false
			};

			index[id] = item;
			items.push(item);
		});

		// make a graph from parent relations
		items.forEach(function (item) {
			if (item.parent !== undefined) {
				item.parent = index[item.parent];
				item.parent.children.push(item);
			}
		});

		// pad items
		items.forEach(function (item) {

			item.left = 0;
			if (item.parent !== undefined) {
				item.left = item.parent.left + item.parent.width;
			}
		});

		// position items
		items.forEach(function (item) {
			//console.log(el.left);
			item.el.css("left", item.left);
		});

		// wrap contents
		items.forEach(function (item) {
			item.el.html('<div class="content">' + item.el.html() + '</div>');
		});

		// add parent classes
		items.forEach(function (item) {
			if (item.children.length > 0) {
				item.el.addClass("tt-parent");
				var maxIndex = item.children.length - 1;
				console.log(item.children[maxIndex]);
				item.children[maxIndex].lastChild = true;
				item.showChildren = true;
			}
		});

		// draw lines
		items.forEach(function (item) {

			if (item.parent === undefined) {
				return;
			}

			var childPos = item.el.position();
			var parent = item.parent;

			var parentPos = parent.el.position();
			// var height = childPos.top - parentPos.top;
			var height = item.el.height() * 2;
			var width = item.left - parent.left;
			var left = parent.left - item.left + (parent.width / 2);

			var $tail = $('<div class="tail"></div>').css({
				height: height,
				width: width,
				left: left
			});
			item.el.prepend($tail);

			function getRootParent(el) {
				var parent = el.parent;
				if (parent != undefined) {
					if (el.lastChild === false) {
						var height = item.el.height() * 2;
						var width = item.left - parent.left;
						var left = parent.left - item.left + (parent.width / 2);

						var $parentTail = $('<div class="parent-tail"></div>').css({
							height: height,
							width: width,
							left: left
						});
						item.el.prepend($parentTail);
					}
					getRootParent(parent);
				}
			}

			getRootParent(parent);
			// function parentTail(item, grandpa, count) {
			// 	console.log(item);
			// 	console.log(grandpa);

			// 	var childPos = item.el.position();
			// 	var grandpaPos = grandpa.el.position();
			// 	// var height = childPos.top - grandpaPos.top;
			// 	var height = item.el.height()*2;
			// 	var width = item.left - grandpa.left;
			// 	var left = grandpa.left - item.left + (grandpa.width / 2);

			// 	var $tail = $('<div class="parent-tail"></div>').css({
			// 		height: height,
			// 		width: width,
			// 		left: left
			// 	});

			// 	item.el.prepend($tail);

			// 	var grandpa = parent.parent;
			// 	if (grandpa != undefined && count <= 5) {
			// 		count++;
			// 		parentTail(item, grandpa, count)
			// 	}
			// }
			// var count = 0;
			// var grandpa = parent.parent;
			// if (grandpa != undefined && count <= 5) {
			// 	count++;
			// 	parentTail(item, grandpa, count)
			// }
		});

		// handle click event
		$table.on("click", "div.tt div.content", function (e) {

			var $el = $(e.currentTarget).closest(".tt");
			var $tr = $el.closest("tr");
			var id = $el.data('tt-id');
			var item = index[id];

			if (item.showChildren === true) {
				// hide all children
				item.showChildren = false;

				function hide(parentId) {
					var item = index[parentId];
					item.children.forEach(function (child) {
						if (child.showChildren !== undefined) {
							child.showChildren = false;
						}
						$(child.el).closest("tr").addClass("tt-hide");
						hide(child.id);
					});
				}

				hide(id);
			}
			else {
				// show direct children
				item.showChildren = true;
				item.children.forEach(function (child) {
					$(child.el).closest("tr").removeClass("tt-hide");
				});
			}
		});

		// initially hide all children
		items.forEach(function (item) {

			if (item.parent === undefined && item.children.length > 0) {
				item.el.find(".content").click();
			}
		});
	}
});

