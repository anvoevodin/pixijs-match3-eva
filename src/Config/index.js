let Configer = {

};

export default {
	"paths": {
		"imagesUri": "static/images/"
	},

	"field": {
		"frontTileSpeed": 550, //px per sec
		"frontTileWidth": 70,
		"frontTileHeight": 70,
		"backTileWidth": 80,
		"backTileHeight": 80,

		/* All patterns to look for matches on the field. All pieces will be going through these
		   patterns and be using pattern items relative to themselves col and row
		   +/- means that a pattern will be looking for pieces as long as they will be there
		   depending on previous tile, and also means that it's not required. "+" and "-" can find
		   nothing, and it's will be counted (unlike usual pattern items). E.g.:
		   		(0,0) (0,1) (0,"+") is like (0,0) (0,1) (0,2) (0,3) ...) because "+" took last row-value
		   		(0,0) (0,"+") is same: (0,0) (0,1) (0,2) (0,3) ...) because "+" took last row-value
		   		(0,"+") is same too (0,0) (0,1) (0,2) (0,3) ...), when last-row doesn't exist then +/- takes it as zero
		   		the same for minus:
				(0,0) (0,1) (0,"-") is like (0,0) (0,1) (0,0) (0,-1) ...) - no sense, but shows the point of minus
				(0,0) (0, -1) (0,"-") is like (0,0) (0,-1) (0,-2) (0,-3) ...) - no sense, but shows the point of minus
				using (0,0) second and more time means that we kind of "move pointer" before "+" or "-" pattern
		   all patterns will be checked in their order, so it has a sense to put on the top the most
		   unusual and weird patterns and after those other ones.

		   minMatch - minimal number of front tiles to match
		   extraScore - 0 element - how many extra score we get if we match (minMatch + 1) pieces
		   				1 element - how many extra score we get if we match (minMatch + 2) pieces etc... */
		"matchPatterns": [{
				/** 00000
					0111+
					00000
				*/
				"name": "horizontal",
				"minMatch": 3,
				"score": 10,
				"extraScore": [15, 20],
				"list": [[0, 0], [1, 0], ["+", 0]]
			}, {
				/** 00100
					00100
					00100
					00+00
				*/
				"name": "vertical",
				"minMatch": 3,
				"score": 10,
				"extraScore": [15, 20],
				"list": [[0, 0], [0, 1], [0, "+"]]
			}
		]
	},

	/** Which content we load before starting game (key - cid, value - array of prop names) */
	"initialCIDs": {
		1: ["ico", "icoSelected"],
		2: ["ico", "icoSelected"],
		3: ["ico", "icoSelected"],
		4: ["ico", "icoSelected"],
		9: ["ico", "icoSelected"],
		10: ["ico", "icoSelected"],
		11: ["ico", "icoSelected"],
		12: ["ico", "icoSelected"],
		5: ["ico"],
		7: ["ico"]
	},

	/** Which front tiles are available on the field */
	"frontCIDs": [1, 2, 3, 4], //default list of pieces on the field
	// "frontCIDs": [1, 2, 3, 4, 9, 10, 11, 12], //more pieces on the field

	/** Game content */
	"content": {
		"1": {
			"cid": 1,
			"name": "First front tile",
			"ico": "piece01.png",
			"icoSelected": "piece01_02.png",
			"color": "0x8d4747"
		},
		"2": {
			"cid": 2,
			"name": "Second front tile",
			"ico": "piece02.png",
			"icoSelected": "piece02_02.png",
			"color": "0xff3333"
		},
		"3": {
			"cid": 3,
			"name": "Third front tile",
			"ico": "piece03.png",
			"icoSelected": "piece03_02.png",
			"color": "0xfff1dd"
		},
		"4": {
			"cid": 4,
			"name": "Fourth front tile",
			"ico": "piece04.png",
			"icoSelected": "piece04_02.png",
			"color": "0xffcc00"
		},
		"5": {
			"cid": 5,
			"name": "First map",
			"ico": "map01.jpg"
		},
		"6": {
			"cid": 6,
			"name": "First level",
			"cols": 6,
			"rows": 6
		},
		"7": {
			"cid": 7,
			"name": "First back tile",
			"ico": "backTile01.png"
		},
		"8": {
			"cid": 8,
			"name": "Second back tile",
			"ico": "backTile02.png"
		},
		"9": {
			"cid": 9,
			"name": "Fifth front tile",
			"ico": "piece05.png",
			"icoSelected": "piece05_02.png",
			"color": "0x00a0ff"
		},
		"10": {
			"cid": 10,
			"name": "Sixth front tile",
			"ico": "piece06.png",
			"icoSelected": "piece06_02.png",
			"color": "0x6a8d47"
		},
		"11": {
			"cid": 11,
			"name": "Seventh front tile",
			"ico": "piece07.png",
			"icoSelected": "piece07_02.png",
			"color": "0x9c52c1"
		},
		"12": {
			"cid": 12,
			"name": "Eighth front tile",
			"ico": "piece08.png",
			"icoSelected": "piece08_02.png",
			"color": "0xe3f8ec"
		}
	}
}

export { Configer }