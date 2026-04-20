import React, { useState, useMemo } from "react";
import type { ClothingRecommendation } from "../api";
import { generateCatalog } from "../api";

interface CatalogGridProps {
  detectedGender: string | null;
  onSelect: (item: ClothingRecommendation) => void;
  selectedId: string | null;
}

export var CatalogGrid: React.FC<CatalogGridProps> = function(props) {
  var searchState = useState("");
  var categoryState = useState("all");
  var pageState = useState(0);
  var ITEMS_PER_PAGE = 24;

  var allItems = useMemo(function() { return generateCatalog(); }, []);

  var filtered = useMemo(function() {
    var items = allItems;
    if (props.detectedGender) {
      items = items.filter(function(x) { return x.gender === props.detectedGender; });
    }
    if (categoryState[0] !== "all") {
      items = items.filter(function(x) { return x.category === categoryState[0]; });
    }
    if (searchState[0].length > 1) {
      var q = searchState[0].toLowerCase();
      items = items.filter(function(x) { return x.name.toLowerCase().indexOf(q) !== -1 || x.type.indexOf(q) !== -1; });
    }
    return items.sort(function(a, b) { return b.match_score - a.match_score; });
  }, [allItems, props.detectedGender, categoryState[0], searchState[0]]);

  var totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  var pageItems = filtered.slice(pageState[0] * ITEMS_PER_PAGE, (pageState[0] + 1) * ITEMS_PER_PAGE);

  var categories = useMemo(function() {
    var cats: Record<string, string> = {};
    allItems.forEach(function(x) {
      if (props.detectedGender && x.gender !== props.detectedGender) return;
      cats[x.category] = x.category;
    });
    return Object.keys(cats).sort();
  }, [allItems, props.detectedGender]);

  var genderLabel = "🧑 All";
  var genderColor = "from-cyan-500 to-purple-500";
  if (props.detectedGender === "male") {
    genderLabel = "👨 Men's";
    genderColor = "from-blue-500 to-cyan-500";
  } else if (props.detectedGender === "female") {
    genderLabel = "👩 Women's";
    genderColor = "from-pink-500 to-rose-500";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className={"bg-gradient-to-r " + genderColor + " bg-clip-text text-transparent"}>{genderLabel} Collection</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">{filtered.length.toLocaleString()} items - AI Sorted by Match</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={searchState[0]}
          onChange={function(e) { searchState[1](e.target.value); pageState[1](0); }}
          className="flex-1 min-w-[120px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <select
          value={categoryState[0]}
          onChange={function(e) { categoryState[1](e.target.value); pageState[1](0); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all" className="bg-gray-900">All</option>
          {categories.map(function(c) { return <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>; })}
        </select>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {pageItems.map(function(item) {
          var isSelected = props.selectedId === item.id;
          var ringClass = isSelected ? "ring-2 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/30 z-10" : "hover:scale-105 ring-1 ring-white/10 hover:ring-white/30";
          return (
            <button key={item.id} onClick={function() { props.onSelect(item); }} className={"group relative rounded-xl overflow-hidden transition-all duration-300 " + ringClass}>
              <div className="aspect-square flex flex-col items-center justify-center relative" style={{ backgroundColor: item.colorHex }}>
                <span className="text-white/60 text-[10px] font-bold uppercase">{item.type}</span>
                <span className="text-white/40 text-[8px] mt-0.5">{item.price}</span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5">
                  <p className="text-white text-[7px] font-bold text-center truncate px-1">{item.name}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={function() { pageState[1](Math.max(0, pageState[0] - 1)); }} disabled={pageState[0] === 0} className={"px-3 py-1.5 rounded-lg text-xs font-bold " + (pageState[0] === 0 ? "text-white/20 cursor-not-allowed" : "text-white bg-white/10 hover:bg-white/20")}>Prev</button>
          <span className="text-white/50 text-xs">Page {pageState[0] + 1} / {totalPages}</span>
          <button onClick={function() { pageState[1](Math.min(totalPages - 1, pageState[0] + 1)); }} disabled={pageState[0] >= totalPages - 1} className={"px-3 py-1.5 rounded-lg text-xs font-bold " + (pageState[0] >= totalPages - 1 ? "text-white/20 cursor-not-allowed" : "text-white bg-white/10 hover:bg-white/20")}>Next</button>
        </div>
      )}
    </div>
  );
};
