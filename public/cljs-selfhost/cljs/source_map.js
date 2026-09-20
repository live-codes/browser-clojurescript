// Compiled by ClojureScript 1.12.146 {:target :default, :optimizations :simple}
goog.provide('cljs.source_map');
goog.require('cljs.core');
goog.require('clojure.string');
goog.require('clojure.set');
goog.require('cljs.source_map.base64_vlq');
goog.require('goog.object');
goog.scope(function(){
cljs.source_map.goog$module$goog$object = goog.module.get('goog.object');
});
/**
 * Take a seq of source file names and return a map from
 * file number to integer index. For reverse source maps.
 */
cljs.source_map.indexed_sources = (function cljs$source_map$indexed_sources(sources){
return cljs.core.reduce.call(null,(function (m,p__6605){
var vec__6606 = p__6605;
var i = cljs.core.nth.call(null,vec__6606,(0),null);
var v = cljs.core.nth.call(null,vec__6606,(1),null);
return cljs.core.assoc.call(null,m,v,i);
}),cljs.core.PersistentArrayMap.EMPTY,cljs.core.map_indexed.call(null,(function (a,b){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [a,b], null);
}),sources));
});
/**
 * Take a seq of source file names and return a comparator
 * that can be used to construct a sorted map. For reverse
 * source maps.
 */
cljs.source_map.source_compare = (function cljs$source_map$source_compare(sources){
var sources__$1 = cljs.source_map.indexed_sources.call(null,sources);
return (function (a,b){
return cljs.core.compare.call(null,sources__$1.call(null,a),sources__$1.call(null,b));
});
});
/**
 * Take a source map segment represented as a vector
 * and return a map.
 */
cljs.source_map.seg__GT_map = (function cljs$source_map$seg__GT_map(seg,source_map){
var vec__6609 = seg;
var gcol = cljs.core.nth.call(null,vec__6609,(0),null);
var source = cljs.core.nth.call(null,vec__6609,(1),null);
var line = cljs.core.nth.call(null,vec__6609,(2),null);
var col = cljs.core.nth.call(null,vec__6609,(3),null);
var name = cljs.core.nth.call(null,vec__6609,(4),null);
return new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"gcol","gcol",309250807),gcol,new cljs.core.Keyword(null,"source","source",-433931539),(cljs.source_map.goog$module$goog$object.get.call(null,source_map,"sources")[source]),new cljs.core.Keyword(null,"line","line",212345235),line,new cljs.core.Keyword(null,"col","col",-1959363084),col,new cljs.core.Keyword(null,"name","name",1843675177),(function (){var temp__5720__auto__ = new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,seg));
if(cljs.core.truth_(temp__5720__auto__)){
var name__$1 = temp__5720__auto__;
return (cljs.source_map.goog$module$goog$object.get.call(null,source_map,"names")[name__$1]);
} else {
return null;
}
})()], null);
});
/**
 * Combine a source map segment vector and a relative
 * source map segment vector and combine them to get
 * an absolute segment posititon information as a vector.
 */
cljs.source_map.seg_combine = (function cljs$source_map$seg_combine(seg,relseg){
var vec__6612 = seg;
var gcol = cljs.core.nth.call(null,vec__6612,(0),null);
var source = cljs.core.nth.call(null,vec__6612,(1),null);
var line = cljs.core.nth.call(null,vec__6612,(2),null);
var col = cljs.core.nth.call(null,vec__6612,(3),null);
var name = cljs.core.nth.call(null,vec__6612,(4),null);
var vec__6615 = relseg;
var rgcol = cljs.core.nth.call(null,vec__6615,(0),null);
var rsource = cljs.core.nth.call(null,vec__6615,(1),null);
var rline = cljs.core.nth.call(null,vec__6615,(2),null);
var rcol = cljs.core.nth.call(null,vec__6615,(3),null);
var rname = cljs.core.nth.call(null,vec__6615,(4),null);
var nseg = new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [(gcol + rgcol),((function (){var or__1513__auto__ = source;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return (0);
}
})() + rsource),((function (){var or__1513__auto__ = line;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return (0);
}
})() + rline),((function (){var or__1513__auto__ = col;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return (0);
}
})() + rcol),((function (){var or__1513__auto__ = name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return (0);
}
})() + rname)], null);
if(cljs.core.truth_(name)){
return cljs.core.with_meta.call(null,nseg,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"name","name",1843675177),(name + rname)], null));
} else {
return nseg;
}
});
/**
 * Helper for decode-reverse. Take a reverse source map and
 *   update it with a segment map.
 */
cljs.source_map.update_reverse_result = (function cljs$source_map$update_reverse_result(result,segmap,gline){
var map__6618 = segmap;
var map__6618__$1 = cljs.core.__destructure_map.call(null,map__6618);
var gcol = cljs.core.get.call(null,map__6618__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var source = cljs.core.get.call(null,map__6618__$1,new cljs.core.Keyword(null,"source","source",-433931539));
var line = cljs.core.get.call(null,map__6618__$1,new cljs.core.Keyword(null,"line","line",212345235));
var col = cljs.core.get.call(null,map__6618__$1,new cljs.core.Keyword(null,"col","col",-1959363084));
var name = cljs.core.get.call(null,map__6618__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var d = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"gline","gline",-1086242431),gline,new cljs.core.Keyword(null,"gcol","gcol",309250807),gcol], null);
var d__$1 = (cljs.core.truth_(name)?cljs.core.assoc.call(null,d,new cljs.core.Keyword(null,"name","name",1843675177),name):d);
return cljs.core.update_in.call(null,result,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [source], null),cljs.core.fnil.call(null,(function (m){
return cljs.core.update_in.call(null,m,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [line], null),cljs.core.fnil.call(null,(function (m__$1){
return cljs.core.update_in.call(null,m__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [col], null),cljs.core.fnil.call(null,(function (v){
return cljs.core.conj.call(null,v,d__$1);
}),cljs.core.PersistentVector.EMPTY));
}),cljs.core.sorted_map.call(null)));
}),cljs.core.sorted_map.call(null)));
});
/**
 * Convert a v3 source map JSON object into a reverse source map
 *   mapping original ClojureScript source locations to the generated
 *   JavaScript.
 */
cljs.source_map.decode_reverse = (function cljs$source_map$decode_reverse(var_args){
var G__6620 = arguments.length;
switch (G__6620) {
case 1:
return cljs.source_map.decode_reverse.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.source_map.decode_reverse.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.source_map.decode_reverse.cljs$core$IFn$_invoke$arity$1 = (function (source_map){
return cljs.source_map.decode_reverse.call(null,cljs.source_map.goog$module$goog$object.get.call(null,source_map,"mappings"),source_map);
}));

(cljs.source_map.decode_reverse.cljs$core$IFn$_invoke$arity$2 = (function (mappings,source_map){
var sources = cljs.source_map.goog$module$goog$object.get.call(null,source_map,"sources");
var relseg_init = new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),(0),(0),(0)], null);
var lines = cljs.core.seq.call(null,clojure.string.split.call(null,mappings,/;/));
var gline = (0);
var lines__$1 = lines;
var relseg = relseg_init;
var result = cljs.core.sorted_map_by.call(null,cljs.source_map.source_compare.call(null,sources));
while(true){
if(lines__$1){
var line = cljs.core.first.call(null,lines__$1);
var vec__6624 = ((clojure.string.blank_QMARK_.call(null,line))?new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [result,relseg], null):(function (){var segs = cljs.core.seq.call(null,clojure.string.split.call(null,line,/,/));
var segs__$1 = segs;
var relseg__$1 = relseg;
var result__$1 = result;
while(true){
if(segs__$1){
var seg = cljs.core.first.call(null,segs__$1);
var nrelseg = cljs.source_map.seg_combine.call(null,cljs.source_map.base64_vlq.decode.call(null,seg),relseg__$1);
var G__6628 = cljs.core.next.call(null,segs__$1);
var G__6629 = nrelseg;
var G__6630 = cljs.source_map.update_reverse_result.call(null,result__$1,cljs.source_map.seg__GT_map.call(null,nrelseg,source_map),gline);
segs__$1 = G__6628;
relseg__$1 = G__6629;
result__$1 = G__6630;
continue;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [result__$1,relseg__$1], null);
}
break;
}
})());
var result__$1 = cljs.core.nth.call(null,vec__6624,(0),null);
var relseg__$1 = cljs.core.nth.call(null,vec__6624,(1),null);
var G__6631 = (gline + (1));
var G__6632 = cljs.core.next.call(null,lines__$1);
var G__6633 = cljs.core.assoc.call(null,relseg__$1,(0),(0));
var G__6634 = result__$1;
gline = G__6631;
lines__$1 = G__6632;
relseg = G__6633;
result = G__6634;
continue;
} else {
return result;
}
break;
}
}));

(cljs.source_map.decode_reverse.cljs$lang$maxFixedArity = 2);

/**
 * Helper for decode. Take a source map and update it based on a
 *   segment map.
 */
cljs.source_map.update_result = (function cljs$source_map$update_result(result,segmap,gline){
var map__6636 = segmap;
var map__6636__$1 = cljs.core.__destructure_map.call(null,map__6636);
var gcol = cljs.core.get.call(null,map__6636__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var source = cljs.core.get.call(null,map__6636__$1,new cljs.core.Keyword(null,"source","source",-433931539));
var line = cljs.core.get.call(null,map__6636__$1,new cljs.core.Keyword(null,"line","line",212345235));
var col = cljs.core.get.call(null,map__6636__$1,new cljs.core.Keyword(null,"col","col",-1959363084));
var name = cljs.core.get.call(null,map__6636__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var d = new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line,new cljs.core.Keyword(null,"col","col",-1959363084),col,new cljs.core.Keyword(null,"source","source",-433931539),source], null);
var d__$1 = (cljs.core.truth_(name)?cljs.core.assoc.call(null,d,new cljs.core.Keyword(null,"name","name",1843675177),name):d);
return cljs.core.update_in.call(null,result,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline], null),cljs.core.fnil.call(null,(function (m){
return cljs.core.update_in.call(null,m,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol], null),cljs.core.fnil.call(null,(function (p1__6635_SHARP_){
return cljs.core.conj.call(null,p1__6635_SHARP_,d__$1);
}),cljs.core.PersistentVector.EMPTY));
}),cljs.core.sorted_map.call(null)));
});
/**
 * Convert a v3 source map JSON object into a source map mapping
 *   generated JavaScript source locations to the original
 *   ClojureScript.
 */
cljs.source_map.decode = (function cljs$source_map$decode(var_args){
var G__6638 = arguments.length;
switch (G__6638) {
case 1:
return cljs.source_map.decode.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.source_map.decode.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.source_map.decode.cljs$core$IFn$_invoke$arity$1 = (function (source_map){
return cljs.source_map.decode.call(null,cljs.source_map.goog$module$goog$object.get.call(null,source_map,"mappings"),source_map);
}));

(cljs.source_map.decode.cljs$core$IFn$_invoke$arity$2 = (function (mappings,source_map){
var sources = cljs.source_map.goog$module$goog$object.get.call(null,source_map,"sources");
var relseg_init = new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),(0),(0),(0)], null);
var lines = cljs.core.seq.call(null,clojure.string.split.call(null,mappings,/;/));
var gline = (0);
var lines__$1 = lines;
var relseg = relseg_init;
var result = cljs.core.PersistentArrayMap.EMPTY;
while(true){
if(lines__$1){
var line = cljs.core.first.call(null,lines__$1);
var vec__6642 = ((clojure.string.blank_QMARK_.call(null,line))?new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [result,relseg], null):(function (){var segs = cljs.core.seq.call(null,clojure.string.split.call(null,line,/,/));
var segs__$1 = segs;
var relseg__$1 = relseg;
var result__$1 = result;
while(true){
if(segs__$1){
var seg = cljs.core.first.call(null,segs__$1);
var nrelseg = cljs.source_map.seg_combine.call(null,cljs.source_map.base64_vlq.decode.call(null,seg),relseg__$1);
var G__6646 = cljs.core.next.call(null,segs__$1);
var G__6647 = nrelseg;
var G__6648 = cljs.source_map.update_result.call(null,result__$1,cljs.source_map.seg__GT_map.call(null,nrelseg,source_map),gline);
segs__$1 = G__6646;
relseg__$1 = G__6647;
result__$1 = G__6648;
continue;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [result__$1,relseg__$1], null);
}
break;
}
})());
var result__$1 = cljs.core.nth.call(null,vec__6642,(0),null);
var relseg__$1 = cljs.core.nth.call(null,vec__6642,(1),null);
var G__6649 = (gline + (1));
var G__6650 = cljs.core.next.call(null,lines__$1);
var G__6651 = cljs.core.assoc.call(null,relseg__$1,(0),(0));
var G__6652 = result__$1;
gline = G__6649;
lines__$1 = G__6650;
relseg = G__6651;
result = G__6652;
continue;
} else {
return result;
}
break;
}
}));

(cljs.source_map.decode.cljs$lang$maxFixedArity = 2);

/**
 * Take a nested sorted map encoding line and column information
 * for a file and return a vector of vectors of encoded segments.
 * Each vector represents a line, and the internal vectors are segments
 * representing the contents of the line.
 */
cljs.source_map.lines__GT_segs = (function cljs$source_map$lines__GT_segs(lines){
var relseg = cljs.core.atom.call(null,new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),(0),(0),(0)], null));
return cljs.core.reduce.call(null,(function (segs,cols){
cljs.core.swap_BANG_.call(null,relseg,(function (p__6653){
var vec__6654 = p__6653;
var _ = cljs.core.nth.call(null,vec__6654,(0),null);
var source = cljs.core.nth.call(null,vec__6654,(1),null);
var line = cljs.core.nth.call(null,vec__6654,(2),null);
var col = cljs.core.nth.call(null,vec__6654,(3),null);
var name = cljs.core.nth.call(null,vec__6654,(4),null);
return new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),source,line,col,name], null);
}));

return cljs.core.conj.call(null,segs,cljs.core.reduce.call(null,(function (cols__$1,p__6657){
var vec__6658 = p__6657;
var gcol = cljs.core.nth.call(null,vec__6658,(0),null);
var sidx = cljs.core.nth.call(null,vec__6658,(1),null);
var line = cljs.core.nth.call(null,vec__6658,(2),null);
var col = cljs.core.nth.call(null,vec__6658,(3),null);
var name = cljs.core.nth.call(null,vec__6658,(4),null);
var seg = vec__6658;
var offset = cljs.core.map.call(null,cljs.core._,seg,cljs.core.deref.call(null,relseg));
cljs.core.swap_BANG_.call(null,relseg,(function (p__6661){
var vec__6662 = p__6661;
var _ = cljs.core.nth.call(null,vec__6662,(0),null);
var ___$1 = cljs.core.nth.call(null,vec__6662,(1),null);
var ___$2 = cljs.core.nth.call(null,vec__6662,(2),null);
var ___$3 = cljs.core.nth.call(null,vec__6662,(3),null);
var lname = cljs.core.nth.call(null,vec__6662,(4),null);
return new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol,sidx,line,col,(function (){var or__1513__auto__ = name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return lname;
}
})()], null);
}));

return cljs.core.conj.call(null,cols__$1,cljs.source_map.base64_vlq.encode.call(null,offset));
}),cljs.core.PersistentVector.EMPTY,cols));
}),cljs.core.PersistentVector.EMPTY,lines);
});
/**
 * Take an internal source map representation represented as nested
 * sorted maps of file, line, column and return a source map v3 JSON
 * string.
 */
cljs.source_map.encode = (function cljs$source_map$encode(m,opts){
var lines = cljs.core.atom.call(null,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.PersistentVector.EMPTY], null));
var names__GT_idx = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var name_idx = cljs.core.atom.call(null,(0));
var preamble_lines = cljs.core.take.call(null,(function (){var or__1513__auto__ = new cljs.core.Keyword(null,"preamble-line-count","preamble-line-count",-659949744).cljs$core$IFn$_invoke$arity$1(opts);
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return (0);
}
})(),cljs.core.repeat.call(null,cljs.core.PersistentVector.EMPTY));
var info__GT_segv = (function (info,source_idx,line,col){
var segv = new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"gcol","gcol",309250807).cljs$core$IFn$_invoke$arity$1(info),source_idx,line,col], null);
var temp__5718__auto__ = new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(info);
if(cljs.core.truth_(temp__5718__auto__)){
var name = temp__5718__auto__;
var idx = (function (){var temp__5718__auto____$1 = cljs.core.get.call(null,cljs.core.deref.call(null,names__GT_idx),name);
if(cljs.core.truth_(temp__5718__auto____$1)){
var idx = temp__5718__auto____$1;
return idx;
} else {
var cidx = cljs.core.deref.call(null,name_idx);
cljs.core.swap_BANG_.call(null,names__GT_idx,cljs.core.assoc,name,cidx);

cljs.core.swap_BANG_.call(null,name_idx,cljs.core.inc);

return cidx;
}
})();
return cljs.core.conj.call(null,segv,idx);
} else {
return segv;
}
});
var encode_cols = (function (infos,source_idx,line,col){
var seq__6668 = cljs.core.seq.call(null,infos);
var chunk__6669 = null;
var count__6670 = (0);
var i__6671 = (0);
while(true){
if((i__6671 < count__6670)){
var info = cljs.core._nth.call(null,chunk__6669,i__6671);
var segv_7022 = info__GT_segv.call(null,info,source_idx,line,col);
var gline_7023 = new cljs.core.Keyword(null,"gline","gline",-1086242431).cljs$core$IFn$_invoke$arity$1(info);
var lc_7024 = cljs.core.count.call(null,cljs.core.deref.call(null,lines));
if((gline_7023 > (lc_7024 - (1)))){
cljs.core.swap_BANG_.call(null,lines,((function (seq__6668,chunk__6669,count__6670,i__6671,segv_7022,gline_7023,lc_7024,info,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv){
return (function (lines__$1){
return cljs.core.conj.call(null,cljs.core.into.call(null,lines__$1,cljs.core.repeat.call(null,((gline_7023 - (lc_7024 - (1))) - (1)),cljs.core.PersistentVector.EMPTY)),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [segv_7022], null));
});})(seq__6668,chunk__6669,count__6670,i__6671,segv_7022,gline_7023,lc_7024,info,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv))
);
} else {
cljs.core.swap_BANG_.call(null,lines,((function (seq__6668,chunk__6669,count__6670,i__6671,segv_7022,gline_7023,lc_7024,info,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv){
return (function (lines__$1){
return cljs.core.update_in.call(null,lines__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7023], null),cljs.core.conj,segv_7022);
});})(seq__6668,chunk__6669,count__6670,i__6671,segv_7022,gline_7023,lc_7024,info,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv))
);
}


var G__7025 = seq__6668;
var G__7026 = chunk__6669;
var G__7027 = count__6670;
var G__7028 = (i__6671 + (1));
seq__6668 = G__7025;
chunk__6669 = G__7026;
count__6670 = G__7027;
i__6671 = G__7028;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__6668);
if(temp__5720__auto__){
var seq__6668__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6668__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__6668__$1);
var G__7029 = cljs.core.chunk_rest.call(null,seq__6668__$1);
var G__7030 = c__2045__auto__;
var G__7031 = cljs.core.count.call(null,c__2045__auto__);
var G__7032 = (0);
seq__6668 = G__7029;
chunk__6669 = G__7030;
count__6670 = G__7031;
i__6671 = G__7032;
continue;
} else {
var info = cljs.core.first.call(null,seq__6668__$1);
var segv_7033 = info__GT_segv.call(null,info,source_idx,line,col);
var gline_7034 = new cljs.core.Keyword(null,"gline","gline",-1086242431).cljs$core$IFn$_invoke$arity$1(info);
var lc_7035 = cljs.core.count.call(null,cljs.core.deref.call(null,lines));
if((gline_7034 > (lc_7035 - (1)))){
cljs.core.swap_BANG_.call(null,lines,((function (seq__6668,chunk__6669,count__6670,i__6671,segv_7033,gline_7034,lc_7035,info,seq__6668__$1,temp__5720__auto__,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv){
return (function (lines__$1){
return cljs.core.conj.call(null,cljs.core.into.call(null,lines__$1,cljs.core.repeat.call(null,((gline_7034 - (lc_7035 - (1))) - (1)),cljs.core.PersistentVector.EMPTY)),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [segv_7033], null));
});})(seq__6668,chunk__6669,count__6670,i__6671,segv_7033,gline_7034,lc_7035,info,seq__6668__$1,temp__5720__auto__,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv))
);
} else {
cljs.core.swap_BANG_.call(null,lines,((function (seq__6668,chunk__6669,count__6670,i__6671,segv_7033,gline_7034,lc_7035,info,seq__6668__$1,temp__5720__auto__,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv){
return (function (lines__$1){
return cljs.core.update_in.call(null,lines__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7034], null),cljs.core.conj,segv_7033);
});})(seq__6668,chunk__6669,count__6670,i__6671,segv_7033,gline_7034,lc_7035,info,seq__6668__$1,temp__5720__auto__,lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv))
);
}


var G__7036 = cljs.core.next.call(null,seq__6668__$1);
var G__7037 = null;
var G__7038 = (0);
var G__7039 = (0);
seq__6668 = G__7036;
chunk__6669 = G__7037;
count__6670 = G__7038;
i__6671 = G__7039;
continue;
}
} else {
return null;
}
}
break;
}
});
var seq__6672_7040 = cljs.core.seq.call(null,cljs.core.map_indexed.call(null,((function (lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv,encode_cols){
return (function (i,v){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [i,v], null);
});})(lines,names__GT_idx,name_idx,preamble_lines,info__GT_segv,encode_cols))
,m));
var chunk__6673_7041 = null;
var count__6674_7042 = (0);
var i__6675_7043 = (0);
while(true){
if((i__6675_7043 < count__6674_7042)){
var vec__6848_7044 = cljs.core._nth.call(null,chunk__6673_7041,i__6675_7043);
var source_idx_7045 = cljs.core.nth.call(null,vec__6848_7044,(0),null);
var vec__6851_7046 = cljs.core.nth.call(null,vec__6848_7044,(1),null);
var __7047 = cljs.core.nth.call(null,vec__6851_7046,(0),null);
var lines_7048__$1 = cljs.core.nth.call(null,vec__6851_7046,(1),null);
var seq__6854_7049 = cljs.core.seq.call(null,lines_7048__$1);
var chunk__6855_7050 = null;
var count__6856_7051 = (0);
var i__6857_7052 = (0);
while(true){
if((i__6857_7052 < count__6856_7051)){
var vec__6896_7053 = cljs.core._nth.call(null,chunk__6855_7050,i__6857_7052);
var line_7054 = cljs.core.nth.call(null,vec__6896_7053,(0),null);
var cols_7055 = cljs.core.nth.call(null,vec__6896_7053,(1),null);
var seq__6899_7056 = cljs.core.seq.call(null,cols_7055);
var chunk__6900_7057 = null;
var count__6901_7058 = (0);
var i__6902_7059 = (0);
while(true){
if((i__6902_7059 < count__6901_7058)){
var vec__6909_7060 = cljs.core._nth.call(null,chunk__6900_7057,i__6902_7059);
var col_7061 = cljs.core.nth.call(null,vec__6909_7060,(0),null);
var infos_7062 = cljs.core.nth.call(null,vec__6909_7060,(1),null);
encode_cols.call(null,infos_7062,source_idx_7045,line_7054,col_7061);


var G__7063 = seq__6899_7056;
var G__7064 = chunk__6900_7057;
var G__7065 = count__6901_7058;
var G__7066 = (i__6902_7059 + (1));
seq__6899_7056 = G__7063;
chunk__6900_7057 = G__7064;
count__6901_7058 = G__7065;
i__6902_7059 = G__7066;
continue;
} else {
var temp__5720__auto___7067 = cljs.core.seq.call(null,seq__6899_7056);
if(temp__5720__auto___7067){
var seq__6899_7068__$1 = temp__5720__auto___7067;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6899_7068__$1)){
var c__2045__auto___7069 = cljs.core.chunk_first.call(null,seq__6899_7068__$1);
var G__7070 = cljs.core.chunk_rest.call(null,seq__6899_7068__$1);
var G__7071 = c__2045__auto___7069;
var G__7072 = cljs.core.count.call(null,c__2045__auto___7069);
var G__7073 = (0);
seq__6899_7056 = G__7070;
chunk__6900_7057 = G__7071;
count__6901_7058 = G__7072;
i__6902_7059 = G__7073;
continue;
} else {
var vec__6912_7074 = cljs.core.first.call(null,seq__6899_7068__$1);
var col_7075 = cljs.core.nth.call(null,vec__6912_7074,(0),null);
var infos_7076 = cljs.core.nth.call(null,vec__6912_7074,(1),null);
encode_cols.call(null,infos_7076,source_idx_7045,line_7054,col_7075);


var G__7077 = cljs.core.next.call(null,seq__6899_7068__$1);
var G__7078 = null;
var G__7079 = (0);
var G__7080 = (0);
seq__6899_7056 = G__7077;
chunk__6900_7057 = G__7078;
count__6901_7058 = G__7079;
i__6902_7059 = G__7080;
continue;
}
} else {
}
}
break;
}


var G__7081 = seq__6854_7049;
var G__7082 = chunk__6855_7050;
var G__7083 = count__6856_7051;
var G__7084 = (i__6857_7052 + (1));
seq__6854_7049 = G__7081;
chunk__6855_7050 = G__7082;
count__6856_7051 = G__7083;
i__6857_7052 = G__7084;
continue;
} else {
var temp__5720__auto___7085 = cljs.core.seq.call(null,seq__6854_7049);
if(temp__5720__auto___7085){
var seq__6854_7086__$1 = temp__5720__auto___7085;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6854_7086__$1)){
var c__2045__auto___7087 = cljs.core.chunk_first.call(null,seq__6854_7086__$1);
var G__7088 = cljs.core.chunk_rest.call(null,seq__6854_7086__$1);
var G__7089 = c__2045__auto___7087;
var G__7090 = cljs.core.count.call(null,c__2045__auto___7087);
var G__7091 = (0);
seq__6854_7049 = G__7088;
chunk__6855_7050 = G__7089;
count__6856_7051 = G__7090;
i__6857_7052 = G__7091;
continue;
} else {
var vec__6915_7092 = cljs.core.first.call(null,seq__6854_7086__$1);
var line_7093 = cljs.core.nth.call(null,vec__6915_7092,(0),null);
var cols_7094 = cljs.core.nth.call(null,vec__6915_7092,(1),null);
var seq__6918_7095 = cljs.core.seq.call(null,cols_7094);
var chunk__6919_7096 = null;
var count__6920_7097 = (0);
var i__6921_7098 = (0);
while(true){
if((i__6921_7098 < count__6920_7097)){
var vec__6928_7099 = cljs.core._nth.call(null,chunk__6919_7096,i__6921_7098);
var col_7100 = cljs.core.nth.call(null,vec__6928_7099,(0),null);
var infos_7101 = cljs.core.nth.call(null,vec__6928_7099,(1),null);
encode_cols.call(null,infos_7101,source_idx_7045,line_7093,col_7100);


var G__7102 = seq__6918_7095;
var G__7103 = chunk__6919_7096;
var G__7104 = count__6920_7097;
var G__7105 = (i__6921_7098 + (1));
seq__6918_7095 = G__7102;
chunk__6919_7096 = G__7103;
count__6920_7097 = G__7104;
i__6921_7098 = G__7105;
continue;
} else {
var temp__5720__auto___7106__$1 = cljs.core.seq.call(null,seq__6918_7095);
if(temp__5720__auto___7106__$1){
var seq__6918_7107__$1 = temp__5720__auto___7106__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6918_7107__$1)){
var c__2045__auto___7108 = cljs.core.chunk_first.call(null,seq__6918_7107__$1);
var G__7109 = cljs.core.chunk_rest.call(null,seq__6918_7107__$1);
var G__7110 = c__2045__auto___7108;
var G__7111 = cljs.core.count.call(null,c__2045__auto___7108);
var G__7112 = (0);
seq__6918_7095 = G__7109;
chunk__6919_7096 = G__7110;
count__6920_7097 = G__7111;
i__6921_7098 = G__7112;
continue;
} else {
var vec__6931_7113 = cljs.core.first.call(null,seq__6918_7107__$1);
var col_7114 = cljs.core.nth.call(null,vec__6931_7113,(0),null);
var infos_7115 = cljs.core.nth.call(null,vec__6931_7113,(1),null);
encode_cols.call(null,infos_7115,source_idx_7045,line_7093,col_7114);


var G__7116 = cljs.core.next.call(null,seq__6918_7107__$1);
var G__7117 = null;
var G__7118 = (0);
var G__7119 = (0);
seq__6918_7095 = G__7116;
chunk__6919_7096 = G__7117;
count__6920_7097 = G__7118;
i__6921_7098 = G__7119;
continue;
}
} else {
}
}
break;
}


var G__7120 = cljs.core.next.call(null,seq__6854_7086__$1);
var G__7121 = null;
var G__7122 = (0);
var G__7123 = (0);
seq__6854_7049 = G__7120;
chunk__6855_7050 = G__7121;
count__6856_7051 = G__7122;
i__6857_7052 = G__7123;
continue;
}
} else {
}
}
break;
}


var G__7124 = seq__6672_7040;
var G__7125 = chunk__6673_7041;
var G__7126 = count__6674_7042;
var G__7127 = (i__6675_7043 + (1));
seq__6672_7040 = G__7124;
chunk__6673_7041 = G__7125;
count__6674_7042 = G__7126;
i__6675_7043 = G__7127;
continue;
} else {
var temp__5720__auto___7128 = cljs.core.seq.call(null,seq__6672_7040);
if(temp__5720__auto___7128){
var seq__6672_7129__$1 = temp__5720__auto___7128;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6672_7129__$1)){
var c__2045__auto___7130 = cljs.core.chunk_first.call(null,seq__6672_7129__$1);
var G__7131 = cljs.core.chunk_rest.call(null,seq__6672_7129__$1);
var G__7132 = c__2045__auto___7130;
var G__7133 = cljs.core.count.call(null,c__2045__auto___7130);
var G__7134 = (0);
seq__6672_7040 = G__7131;
chunk__6673_7041 = G__7132;
count__6674_7042 = G__7133;
i__6675_7043 = G__7134;
continue;
} else {
var vec__6934_7135 = cljs.core.first.call(null,seq__6672_7129__$1);
var source_idx_7136 = cljs.core.nth.call(null,vec__6934_7135,(0),null);
var vec__6937_7137 = cljs.core.nth.call(null,vec__6934_7135,(1),null);
var __7138 = cljs.core.nth.call(null,vec__6937_7137,(0),null);
var lines_7139__$1 = cljs.core.nth.call(null,vec__6937_7137,(1),null);
var seq__6940_7140 = cljs.core.seq.call(null,lines_7139__$1);
var chunk__6941_7141 = null;
var count__6942_7142 = (0);
var i__6943_7143 = (0);
while(true){
if((i__6943_7143 < count__6942_7142)){
var vec__6982_7144 = cljs.core._nth.call(null,chunk__6941_7141,i__6943_7143);
var line_7145 = cljs.core.nth.call(null,vec__6982_7144,(0),null);
var cols_7146 = cljs.core.nth.call(null,vec__6982_7144,(1),null);
var seq__6985_7147 = cljs.core.seq.call(null,cols_7146);
var chunk__6986_7148 = null;
var count__6987_7149 = (0);
var i__6988_7150 = (0);
while(true){
if((i__6988_7150 < count__6987_7149)){
var vec__6995_7151 = cljs.core._nth.call(null,chunk__6986_7148,i__6988_7150);
var col_7152 = cljs.core.nth.call(null,vec__6995_7151,(0),null);
var infos_7153 = cljs.core.nth.call(null,vec__6995_7151,(1),null);
encode_cols.call(null,infos_7153,source_idx_7136,line_7145,col_7152);


var G__7154 = seq__6985_7147;
var G__7155 = chunk__6986_7148;
var G__7156 = count__6987_7149;
var G__7157 = (i__6988_7150 + (1));
seq__6985_7147 = G__7154;
chunk__6986_7148 = G__7155;
count__6987_7149 = G__7156;
i__6988_7150 = G__7157;
continue;
} else {
var temp__5720__auto___7158__$1 = cljs.core.seq.call(null,seq__6985_7147);
if(temp__5720__auto___7158__$1){
var seq__6985_7159__$1 = temp__5720__auto___7158__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6985_7159__$1)){
var c__2045__auto___7160 = cljs.core.chunk_first.call(null,seq__6985_7159__$1);
var G__7161 = cljs.core.chunk_rest.call(null,seq__6985_7159__$1);
var G__7162 = c__2045__auto___7160;
var G__7163 = cljs.core.count.call(null,c__2045__auto___7160);
var G__7164 = (0);
seq__6985_7147 = G__7161;
chunk__6986_7148 = G__7162;
count__6987_7149 = G__7163;
i__6988_7150 = G__7164;
continue;
} else {
var vec__6998_7165 = cljs.core.first.call(null,seq__6985_7159__$1);
var col_7166 = cljs.core.nth.call(null,vec__6998_7165,(0),null);
var infos_7167 = cljs.core.nth.call(null,vec__6998_7165,(1),null);
encode_cols.call(null,infos_7167,source_idx_7136,line_7145,col_7166);


var G__7168 = cljs.core.next.call(null,seq__6985_7159__$1);
var G__7169 = null;
var G__7170 = (0);
var G__7171 = (0);
seq__6985_7147 = G__7168;
chunk__6986_7148 = G__7169;
count__6987_7149 = G__7170;
i__6988_7150 = G__7171;
continue;
}
} else {
}
}
break;
}


var G__7172 = seq__6940_7140;
var G__7173 = chunk__6941_7141;
var G__7174 = count__6942_7142;
var G__7175 = (i__6943_7143 + (1));
seq__6940_7140 = G__7172;
chunk__6941_7141 = G__7173;
count__6942_7142 = G__7174;
i__6943_7143 = G__7175;
continue;
} else {
var temp__5720__auto___7176__$1 = cljs.core.seq.call(null,seq__6940_7140);
if(temp__5720__auto___7176__$1){
var seq__6940_7177__$1 = temp__5720__auto___7176__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__6940_7177__$1)){
var c__2045__auto___7178 = cljs.core.chunk_first.call(null,seq__6940_7177__$1);
var G__7179 = cljs.core.chunk_rest.call(null,seq__6940_7177__$1);
var G__7180 = c__2045__auto___7178;
var G__7181 = cljs.core.count.call(null,c__2045__auto___7178);
var G__7182 = (0);
seq__6940_7140 = G__7179;
chunk__6941_7141 = G__7180;
count__6942_7142 = G__7181;
i__6943_7143 = G__7182;
continue;
} else {
var vec__7001_7183 = cljs.core.first.call(null,seq__6940_7177__$1);
var line_7184 = cljs.core.nth.call(null,vec__7001_7183,(0),null);
var cols_7185 = cljs.core.nth.call(null,vec__7001_7183,(1),null);
var seq__7004_7186 = cljs.core.seq.call(null,cols_7185);
var chunk__7005_7187 = null;
var count__7006_7188 = (0);
var i__7007_7189 = (0);
while(true){
if((i__7007_7189 < count__7006_7188)){
var vec__7014_7190 = cljs.core._nth.call(null,chunk__7005_7187,i__7007_7189);
var col_7191 = cljs.core.nth.call(null,vec__7014_7190,(0),null);
var infos_7192 = cljs.core.nth.call(null,vec__7014_7190,(1),null);
encode_cols.call(null,infos_7192,source_idx_7136,line_7184,col_7191);


var G__7193 = seq__7004_7186;
var G__7194 = chunk__7005_7187;
var G__7195 = count__7006_7188;
var G__7196 = (i__7007_7189 + (1));
seq__7004_7186 = G__7193;
chunk__7005_7187 = G__7194;
count__7006_7188 = G__7195;
i__7007_7189 = G__7196;
continue;
} else {
var temp__5720__auto___7197__$2 = cljs.core.seq.call(null,seq__7004_7186);
if(temp__5720__auto___7197__$2){
var seq__7004_7198__$1 = temp__5720__auto___7197__$2;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7004_7198__$1)){
var c__2045__auto___7199 = cljs.core.chunk_first.call(null,seq__7004_7198__$1);
var G__7200 = cljs.core.chunk_rest.call(null,seq__7004_7198__$1);
var G__7201 = c__2045__auto___7199;
var G__7202 = cljs.core.count.call(null,c__2045__auto___7199);
var G__7203 = (0);
seq__7004_7186 = G__7200;
chunk__7005_7187 = G__7201;
count__7006_7188 = G__7202;
i__7007_7189 = G__7203;
continue;
} else {
var vec__7017_7204 = cljs.core.first.call(null,seq__7004_7198__$1);
var col_7205 = cljs.core.nth.call(null,vec__7017_7204,(0),null);
var infos_7206 = cljs.core.nth.call(null,vec__7017_7204,(1),null);
encode_cols.call(null,infos_7206,source_idx_7136,line_7184,col_7205);


var G__7207 = cljs.core.next.call(null,seq__7004_7198__$1);
var G__7208 = null;
var G__7209 = (0);
var G__7210 = (0);
seq__7004_7186 = G__7207;
chunk__7005_7187 = G__7208;
count__7006_7188 = G__7209;
i__7007_7189 = G__7210;
continue;
}
} else {
}
}
break;
}


var G__7211 = cljs.core.next.call(null,seq__6940_7177__$1);
var G__7212 = null;
var G__7213 = (0);
var G__7214 = (0);
seq__6940_7140 = G__7211;
chunk__6941_7141 = G__7212;
count__6942_7142 = G__7213;
i__6943_7143 = G__7214;
continue;
}
} else {
}
}
break;
}


var G__7215 = cljs.core.next.call(null,seq__6672_7129__$1);
var G__7216 = null;
var G__7217 = (0);
var G__7218 = (0);
seq__6672_7040 = G__7215;
chunk__6673_7041 = G__7216;
count__6674_7042 = G__7217;
i__6675_7043 = G__7218;
continue;
}
} else {
}
}
break;
}

var source_map_file_contents = (function (){var G__7020 = ({"version": (3), "file": new cljs.core.Keyword(null,"file","file",-1269645878).cljs$core$IFn$_invoke$arity$1(opts), "sources": (function (){var paths = cljs.core.keys.call(null,m);
var f = cljs.core.comp.call(null,((new cljs.core.Keyword(null,"source-map-timestamp","source-map-timestamp",1973015633).cljs$core$IFn$_invoke$arity$1(opts) === true)?(function (p1__6665_SHARP_){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(p1__6665_SHARP_)+"?rel="+cljs.core.str.cljs$core$IFn$_invoke$arity$1((new Date()).valueOf()));
}):cljs.core.identity),(function (p1__6666_SHARP_){
return cljs.core.last.call(null,clojure.string.split.call(null,p1__6666_SHARP_,/\//));
}));
return cljs.core.into_array.call(null,cljs.core.map.call(null,f,paths));
})(), "lineCount": new cljs.core.Keyword(null,"lines","lines",-700165781).cljs$core$IFn$_invoke$arity$1(opts), "mappings": clojure.string.join.call(null,";",cljs.core.map.call(null,(function (p1__6667_SHARP_){
return clojure.string.join.call(null,",",p1__6667_SHARP_);
}),cljs.source_map.lines__GT_segs.call(null,cljs.core.concat.call(null,preamble_lines,cljs.core.deref.call(null,lines))))), "names": cljs.core.into_array.call(null,cljs.core.map.call(null,clojure.set.map_invert.call(null,cljs.core.deref.call(null,names__GT_idx)),cljs.core.range.call(null,cljs.core.count.call(null,cljs.core.deref.call(null,names__GT_idx)))))});
if(cljs.core.truth_(new cljs.core.Keyword(null,"sources-content","sources-content",1729970239).cljs$core$IFn$_invoke$arity$1(opts))){
var G__7021 = G__7020;
cljs.source_map.goog$module$goog$object.set.call(null,G__7021,"sourcesContent",cljs.core.into_array.call(null,new cljs.core.Keyword(null,"sources-content","sources-content",1729970239).cljs$core$IFn$_invoke$arity$1(opts)));

return G__7021;
} else {
return G__7020;
}
})();
return JSON.stringify(source_map_file_contents);
});
/**
 * Merge an internal source map representation of a single
 * ClojureScript file mapping original to generated with a
 * second source map mapping original JS to generated JS.
 * The is to support source maps that work through multiple
 * compilation steps like Google Closure optimization passes.
 */
cljs.source_map.merge_source_maps = (function cljs$source_map$merge_source_maps(cljs_map,js_map){
var line_map_seq = cljs.core.seq.call(null,cljs_map);
var new_lines = cljs.core.sorted_map.call(null);
while(true){
if(line_map_seq){
var vec__7219 = cljs.core.first.call(null,line_map_seq);
var line = cljs.core.nth.call(null,vec__7219,(0),null);
var col_map = cljs.core.nth.call(null,vec__7219,(1),null);
var new_cols = (function (){var col_map_seq = cljs.core.seq.call(null,col_map);
var new_cols = cljs.core.sorted_map.call(null);
while(true){
if(col_map_seq){
var vec__7222 = cljs.core.first.call(null,col_map_seq);
var col = cljs.core.nth.call(null,vec__7222,(0),null);
var infos = cljs.core.nth.call(null,vec__7222,(1),null);
var G__7227 = cljs.core.next.call(null,col_map_seq);
var G__7228 = cljs.core.assoc.call(null,new_cols,col,cljs.core.reduce.call(null,((function (col_map_seq,new_cols,line_map_seq,new_lines,vec__7222,col,infos,vec__7219,line,col_map){
return (function (v,p__7225){
var map__7226 = p__7225;
var map__7226__$1 = cljs.core.__destructure_map.call(null,map__7226);
var gline = cljs.core.get.call(null,map__7226__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol = cljs.core.get.call(null,map__7226__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
return cljs.core.into.call(null,v,cljs.core.get_in.call(null,js_map,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline,gcol], null)));
});})(col_map_seq,new_cols,line_map_seq,new_lines,vec__7222,col,infos,vec__7219,line,col_map))
,cljs.core.PersistentVector.EMPTY,infos));
col_map_seq = G__7227;
new_cols = G__7228;
continue;
} else {
return new_cols;
}
break;
}
})();
var G__7229 = cljs.core.next.call(null,line_map_seq);
var G__7230 = cljs.core.assoc.call(null,new_lines,line,new_cols);
line_map_seq = G__7229;
new_lines = G__7230;
continue;
} else {
return new_lines;
}
break;
}
});
/**
 * Given a ClojureScript to JavaScript source map, invert it. Useful when
 * mapping JavaScript stack traces when environment support is unavailable.
 */
cljs.source_map.invert_reverse_map = (function cljs$source_map$invert_reverse_map(reverse_map){
var inverted = cljs.core.atom.call(null,cljs.core.sorted_map.call(null));
var seq__7231_7439 = cljs.core.seq.call(null,reverse_map);
var chunk__7232_7440 = null;
var count__7233_7441 = (0);
var i__7234_7442 = (0);
while(true){
if((i__7234_7442 < count__7233_7441)){
var vec__7337_7443 = cljs.core._nth.call(null,chunk__7232_7440,i__7234_7442);
var line_7444 = cljs.core.nth.call(null,vec__7337_7443,(0),null);
var columns_7445 = cljs.core.nth.call(null,vec__7337_7443,(1),null);
var seq__7340_7446 = cljs.core.seq.call(null,columns_7445);
var chunk__7341_7447 = null;
var count__7342_7448 = (0);
var i__7343_7449 = (0);
while(true){
if((i__7343_7449 < count__7342_7448)){
var vec__7366_7450 = cljs.core._nth.call(null,chunk__7341_7447,i__7343_7449);
var column_7451 = cljs.core.nth.call(null,vec__7366_7450,(0),null);
var column_info_7452 = cljs.core.nth.call(null,vec__7366_7450,(1),null);
var seq__7369_7453 = cljs.core.seq.call(null,column_info_7452);
var chunk__7370_7454 = null;
var count__7371_7455 = (0);
var i__7372_7456 = (0);
while(true){
if((i__7372_7456 < count__7371_7455)){
var map__7375_7457 = cljs.core._nth.call(null,chunk__7370_7454,i__7372_7456);
var map__7375_7458__$1 = cljs.core.__destructure_map.call(null,map__7375_7457);
var gline_7459 = cljs.core.get.call(null,map__7375_7458__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7460 = cljs.core.get.call(null,map__7375_7458__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7461 = cljs.core.get.call(null,map__7375_7458__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7459], null),cljs.core.fnil.call(null,((function (seq__7369_7453,chunk__7370_7454,count__7371_7455,i__7372_7456,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7375_7457,map__7375_7458__$1,gline_7459,gcol_7460,name_7461,vec__7366_7450,column_7451,column_info_7452,vec__7337_7443,line_7444,columns_7445,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7460], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7444,new cljs.core.Keyword(null,"col","col",-1959363084),column_7451,new cljs.core.Keyword(null,"name","name",1843675177),name_7461], null));
});})(seq__7369_7453,chunk__7370_7454,count__7371_7455,i__7372_7456,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7375_7457,map__7375_7458__$1,gline_7459,gcol_7460,name_7461,vec__7366_7450,column_7451,column_info_7452,vec__7337_7443,line_7444,columns_7445,inverted))
,cljs.core.sorted_map.call(null)));


var G__7462 = seq__7369_7453;
var G__7463 = chunk__7370_7454;
var G__7464 = count__7371_7455;
var G__7465 = (i__7372_7456 + (1));
seq__7369_7453 = G__7462;
chunk__7370_7454 = G__7463;
count__7371_7455 = G__7464;
i__7372_7456 = G__7465;
continue;
} else {
var temp__5720__auto___7466 = cljs.core.seq.call(null,seq__7369_7453);
if(temp__5720__auto___7466){
var seq__7369_7467__$1 = temp__5720__auto___7466;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7369_7467__$1)){
var c__2045__auto___7468 = cljs.core.chunk_first.call(null,seq__7369_7467__$1);
var G__7469 = cljs.core.chunk_rest.call(null,seq__7369_7467__$1);
var G__7470 = c__2045__auto___7468;
var G__7471 = cljs.core.count.call(null,c__2045__auto___7468);
var G__7472 = (0);
seq__7369_7453 = G__7469;
chunk__7370_7454 = G__7470;
count__7371_7455 = G__7471;
i__7372_7456 = G__7472;
continue;
} else {
var map__7376_7473 = cljs.core.first.call(null,seq__7369_7467__$1);
var map__7376_7474__$1 = cljs.core.__destructure_map.call(null,map__7376_7473);
var gline_7475 = cljs.core.get.call(null,map__7376_7474__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7476 = cljs.core.get.call(null,map__7376_7474__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7477 = cljs.core.get.call(null,map__7376_7474__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7475], null),cljs.core.fnil.call(null,((function (seq__7369_7453,chunk__7370_7454,count__7371_7455,i__7372_7456,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7376_7473,map__7376_7474__$1,gline_7475,gcol_7476,name_7477,seq__7369_7467__$1,temp__5720__auto___7466,vec__7366_7450,column_7451,column_info_7452,vec__7337_7443,line_7444,columns_7445,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7476], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7444,new cljs.core.Keyword(null,"col","col",-1959363084),column_7451,new cljs.core.Keyword(null,"name","name",1843675177),name_7477], null));
});})(seq__7369_7453,chunk__7370_7454,count__7371_7455,i__7372_7456,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7376_7473,map__7376_7474__$1,gline_7475,gcol_7476,name_7477,seq__7369_7467__$1,temp__5720__auto___7466,vec__7366_7450,column_7451,column_info_7452,vec__7337_7443,line_7444,columns_7445,inverted))
,cljs.core.sorted_map.call(null)));


var G__7478 = cljs.core.next.call(null,seq__7369_7467__$1);
var G__7479 = null;
var G__7480 = (0);
var G__7481 = (0);
seq__7369_7453 = G__7478;
chunk__7370_7454 = G__7479;
count__7371_7455 = G__7480;
i__7372_7456 = G__7481;
continue;
}
} else {
}
}
break;
}


var G__7482 = seq__7340_7446;
var G__7483 = chunk__7341_7447;
var G__7484 = count__7342_7448;
var G__7485 = (i__7343_7449 + (1));
seq__7340_7446 = G__7482;
chunk__7341_7447 = G__7483;
count__7342_7448 = G__7484;
i__7343_7449 = G__7485;
continue;
} else {
var temp__5720__auto___7486 = cljs.core.seq.call(null,seq__7340_7446);
if(temp__5720__auto___7486){
var seq__7340_7487__$1 = temp__5720__auto___7486;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7340_7487__$1)){
var c__2045__auto___7488 = cljs.core.chunk_first.call(null,seq__7340_7487__$1);
var G__7489 = cljs.core.chunk_rest.call(null,seq__7340_7487__$1);
var G__7490 = c__2045__auto___7488;
var G__7491 = cljs.core.count.call(null,c__2045__auto___7488);
var G__7492 = (0);
seq__7340_7446 = G__7489;
chunk__7341_7447 = G__7490;
count__7342_7448 = G__7491;
i__7343_7449 = G__7492;
continue;
} else {
var vec__7377_7493 = cljs.core.first.call(null,seq__7340_7487__$1);
var column_7494 = cljs.core.nth.call(null,vec__7377_7493,(0),null);
var column_info_7495 = cljs.core.nth.call(null,vec__7377_7493,(1),null);
var seq__7380_7496 = cljs.core.seq.call(null,column_info_7495);
var chunk__7381_7497 = null;
var count__7382_7498 = (0);
var i__7383_7499 = (0);
while(true){
if((i__7383_7499 < count__7382_7498)){
var map__7386_7500 = cljs.core._nth.call(null,chunk__7381_7497,i__7383_7499);
var map__7386_7501__$1 = cljs.core.__destructure_map.call(null,map__7386_7500);
var gline_7502 = cljs.core.get.call(null,map__7386_7501__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7503 = cljs.core.get.call(null,map__7386_7501__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7504 = cljs.core.get.call(null,map__7386_7501__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7502], null),cljs.core.fnil.call(null,((function (seq__7380_7496,chunk__7381_7497,count__7382_7498,i__7383_7499,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7386_7500,map__7386_7501__$1,gline_7502,gcol_7503,name_7504,vec__7377_7493,column_7494,column_info_7495,seq__7340_7487__$1,temp__5720__auto___7486,vec__7337_7443,line_7444,columns_7445,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7503], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7444,new cljs.core.Keyword(null,"col","col",-1959363084),column_7494,new cljs.core.Keyword(null,"name","name",1843675177),name_7504], null));
});})(seq__7380_7496,chunk__7381_7497,count__7382_7498,i__7383_7499,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7386_7500,map__7386_7501__$1,gline_7502,gcol_7503,name_7504,vec__7377_7493,column_7494,column_info_7495,seq__7340_7487__$1,temp__5720__auto___7486,vec__7337_7443,line_7444,columns_7445,inverted))
,cljs.core.sorted_map.call(null)));


var G__7505 = seq__7380_7496;
var G__7506 = chunk__7381_7497;
var G__7507 = count__7382_7498;
var G__7508 = (i__7383_7499 + (1));
seq__7380_7496 = G__7505;
chunk__7381_7497 = G__7506;
count__7382_7498 = G__7507;
i__7383_7499 = G__7508;
continue;
} else {
var temp__5720__auto___7509__$1 = cljs.core.seq.call(null,seq__7380_7496);
if(temp__5720__auto___7509__$1){
var seq__7380_7510__$1 = temp__5720__auto___7509__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7380_7510__$1)){
var c__2045__auto___7511 = cljs.core.chunk_first.call(null,seq__7380_7510__$1);
var G__7512 = cljs.core.chunk_rest.call(null,seq__7380_7510__$1);
var G__7513 = c__2045__auto___7511;
var G__7514 = cljs.core.count.call(null,c__2045__auto___7511);
var G__7515 = (0);
seq__7380_7496 = G__7512;
chunk__7381_7497 = G__7513;
count__7382_7498 = G__7514;
i__7383_7499 = G__7515;
continue;
} else {
var map__7387_7516 = cljs.core.first.call(null,seq__7380_7510__$1);
var map__7387_7517__$1 = cljs.core.__destructure_map.call(null,map__7387_7516);
var gline_7518 = cljs.core.get.call(null,map__7387_7517__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7519 = cljs.core.get.call(null,map__7387_7517__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7520 = cljs.core.get.call(null,map__7387_7517__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7518], null),cljs.core.fnil.call(null,((function (seq__7380_7496,chunk__7381_7497,count__7382_7498,i__7383_7499,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7387_7516,map__7387_7517__$1,gline_7518,gcol_7519,name_7520,seq__7380_7510__$1,temp__5720__auto___7509__$1,vec__7377_7493,column_7494,column_info_7495,seq__7340_7487__$1,temp__5720__auto___7486,vec__7337_7443,line_7444,columns_7445,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7519], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7444,new cljs.core.Keyword(null,"col","col",-1959363084),column_7494,new cljs.core.Keyword(null,"name","name",1843675177),name_7520], null));
});})(seq__7380_7496,chunk__7381_7497,count__7382_7498,i__7383_7499,seq__7340_7446,chunk__7341_7447,count__7342_7448,i__7343_7449,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7387_7516,map__7387_7517__$1,gline_7518,gcol_7519,name_7520,seq__7380_7510__$1,temp__5720__auto___7509__$1,vec__7377_7493,column_7494,column_info_7495,seq__7340_7487__$1,temp__5720__auto___7486,vec__7337_7443,line_7444,columns_7445,inverted))
,cljs.core.sorted_map.call(null)));


var G__7521 = cljs.core.next.call(null,seq__7380_7510__$1);
var G__7522 = null;
var G__7523 = (0);
var G__7524 = (0);
seq__7380_7496 = G__7521;
chunk__7381_7497 = G__7522;
count__7382_7498 = G__7523;
i__7383_7499 = G__7524;
continue;
}
} else {
}
}
break;
}


var G__7525 = cljs.core.next.call(null,seq__7340_7487__$1);
var G__7526 = null;
var G__7527 = (0);
var G__7528 = (0);
seq__7340_7446 = G__7525;
chunk__7341_7447 = G__7526;
count__7342_7448 = G__7527;
i__7343_7449 = G__7528;
continue;
}
} else {
}
}
break;
}


var G__7529 = seq__7231_7439;
var G__7530 = chunk__7232_7440;
var G__7531 = count__7233_7441;
var G__7532 = (i__7234_7442 + (1));
seq__7231_7439 = G__7529;
chunk__7232_7440 = G__7530;
count__7233_7441 = G__7531;
i__7234_7442 = G__7532;
continue;
} else {
var temp__5720__auto___7533 = cljs.core.seq.call(null,seq__7231_7439);
if(temp__5720__auto___7533){
var seq__7231_7534__$1 = temp__5720__auto___7533;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7231_7534__$1)){
var c__2045__auto___7535 = cljs.core.chunk_first.call(null,seq__7231_7534__$1);
var G__7536 = cljs.core.chunk_rest.call(null,seq__7231_7534__$1);
var G__7537 = c__2045__auto___7535;
var G__7538 = cljs.core.count.call(null,c__2045__auto___7535);
var G__7539 = (0);
seq__7231_7439 = G__7536;
chunk__7232_7440 = G__7537;
count__7233_7441 = G__7538;
i__7234_7442 = G__7539;
continue;
} else {
var vec__7388_7540 = cljs.core.first.call(null,seq__7231_7534__$1);
var line_7541 = cljs.core.nth.call(null,vec__7388_7540,(0),null);
var columns_7542 = cljs.core.nth.call(null,vec__7388_7540,(1),null);
var seq__7391_7543 = cljs.core.seq.call(null,columns_7542);
var chunk__7392_7544 = null;
var count__7393_7545 = (0);
var i__7394_7546 = (0);
while(true){
if((i__7394_7546 < count__7393_7545)){
var vec__7417_7547 = cljs.core._nth.call(null,chunk__7392_7544,i__7394_7546);
var column_7548 = cljs.core.nth.call(null,vec__7417_7547,(0),null);
var column_info_7549 = cljs.core.nth.call(null,vec__7417_7547,(1),null);
var seq__7420_7550 = cljs.core.seq.call(null,column_info_7549);
var chunk__7421_7551 = null;
var count__7422_7552 = (0);
var i__7423_7553 = (0);
while(true){
if((i__7423_7553 < count__7422_7552)){
var map__7426_7554 = cljs.core._nth.call(null,chunk__7421_7551,i__7423_7553);
var map__7426_7555__$1 = cljs.core.__destructure_map.call(null,map__7426_7554);
var gline_7556 = cljs.core.get.call(null,map__7426_7555__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7557 = cljs.core.get.call(null,map__7426_7555__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7558 = cljs.core.get.call(null,map__7426_7555__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7556], null),cljs.core.fnil.call(null,((function (seq__7420_7550,chunk__7421_7551,count__7422_7552,i__7423_7553,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7426_7554,map__7426_7555__$1,gline_7556,gcol_7557,name_7558,vec__7417_7547,column_7548,column_info_7549,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7557], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7541,new cljs.core.Keyword(null,"col","col",-1959363084),column_7548,new cljs.core.Keyword(null,"name","name",1843675177),name_7558], null));
});})(seq__7420_7550,chunk__7421_7551,count__7422_7552,i__7423_7553,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7426_7554,map__7426_7555__$1,gline_7556,gcol_7557,name_7558,vec__7417_7547,column_7548,column_info_7549,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted))
,cljs.core.sorted_map.call(null)));


var G__7559 = seq__7420_7550;
var G__7560 = chunk__7421_7551;
var G__7561 = count__7422_7552;
var G__7562 = (i__7423_7553 + (1));
seq__7420_7550 = G__7559;
chunk__7421_7551 = G__7560;
count__7422_7552 = G__7561;
i__7423_7553 = G__7562;
continue;
} else {
var temp__5720__auto___7563__$1 = cljs.core.seq.call(null,seq__7420_7550);
if(temp__5720__auto___7563__$1){
var seq__7420_7564__$1 = temp__5720__auto___7563__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7420_7564__$1)){
var c__2045__auto___7565 = cljs.core.chunk_first.call(null,seq__7420_7564__$1);
var G__7566 = cljs.core.chunk_rest.call(null,seq__7420_7564__$1);
var G__7567 = c__2045__auto___7565;
var G__7568 = cljs.core.count.call(null,c__2045__auto___7565);
var G__7569 = (0);
seq__7420_7550 = G__7566;
chunk__7421_7551 = G__7567;
count__7422_7552 = G__7568;
i__7423_7553 = G__7569;
continue;
} else {
var map__7427_7570 = cljs.core.first.call(null,seq__7420_7564__$1);
var map__7427_7571__$1 = cljs.core.__destructure_map.call(null,map__7427_7570);
var gline_7572 = cljs.core.get.call(null,map__7427_7571__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7573 = cljs.core.get.call(null,map__7427_7571__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7574 = cljs.core.get.call(null,map__7427_7571__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7572], null),cljs.core.fnil.call(null,((function (seq__7420_7550,chunk__7421_7551,count__7422_7552,i__7423_7553,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7427_7570,map__7427_7571__$1,gline_7572,gcol_7573,name_7574,seq__7420_7564__$1,temp__5720__auto___7563__$1,vec__7417_7547,column_7548,column_info_7549,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7573], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7541,new cljs.core.Keyword(null,"col","col",-1959363084),column_7548,new cljs.core.Keyword(null,"name","name",1843675177),name_7574], null));
});})(seq__7420_7550,chunk__7421_7551,count__7422_7552,i__7423_7553,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7427_7570,map__7427_7571__$1,gline_7572,gcol_7573,name_7574,seq__7420_7564__$1,temp__5720__auto___7563__$1,vec__7417_7547,column_7548,column_info_7549,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted))
,cljs.core.sorted_map.call(null)));


var G__7575 = cljs.core.next.call(null,seq__7420_7564__$1);
var G__7576 = null;
var G__7577 = (0);
var G__7578 = (0);
seq__7420_7550 = G__7575;
chunk__7421_7551 = G__7576;
count__7422_7552 = G__7577;
i__7423_7553 = G__7578;
continue;
}
} else {
}
}
break;
}


var G__7579 = seq__7391_7543;
var G__7580 = chunk__7392_7544;
var G__7581 = count__7393_7545;
var G__7582 = (i__7394_7546 + (1));
seq__7391_7543 = G__7579;
chunk__7392_7544 = G__7580;
count__7393_7545 = G__7581;
i__7394_7546 = G__7582;
continue;
} else {
var temp__5720__auto___7583__$1 = cljs.core.seq.call(null,seq__7391_7543);
if(temp__5720__auto___7583__$1){
var seq__7391_7584__$1 = temp__5720__auto___7583__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7391_7584__$1)){
var c__2045__auto___7585 = cljs.core.chunk_first.call(null,seq__7391_7584__$1);
var G__7586 = cljs.core.chunk_rest.call(null,seq__7391_7584__$1);
var G__7587 = c__2045__auto___7585;
var G__7588 = cljs.core.count.call(null,c__2045__auto___7585);
var G__7589 = (0);
seq__7391_7543 = G__7586;
chunk__7392_7544 = G__7587;
count__7393_7545 = G__7588;
i__7394_7546 = G__7589;
continue;
} else {
var vec__7428_7590 = cljs.core.first.call(null,seq__7391_7584__$1);
var column_7591 = cljs.core.nth.call(null,vec__7428_7590,(0),null);
var column_info_7592 = cljs.core.nth.call(null,vec__7428_7590,(1),null);
var seq__7431_7593 = cljs.core.seq.call(null,column_info_7592);
var chunk__7432_7594 = null;
var count__7433_7595 = (0);
var i__7434_7596 = (0);
while(true){
if((i__7434_7596 < count__7433_7595)){
var map__7437_7597 = cljs.core._nth.call(null,chunk__7432_7594,i__7434_7596);
var map__7437_7598__$1 = cljs.core.__destructure_map.call(null,map__7437_7597);
var gline_7599 = cljs.core.get.call(null,map__7437_7598__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7600 = cljs.core.get.call(null,map__7437_7598__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7601 = cljs.core.get.call(null,map__7437_7598__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7599], null),cljs.core.fnil.call(null,((function (seq__7431_7593,chunk__7432_7594,count__7433_7595,i__7434_7596,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7437_7597,map__7437_7598__$1,gline_7599,gcol_7600,name_7601,vec__7428_7590,column_7591,column_info_7592,seq__7391_7584__$1,temp__5720__auto___7583__$1,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7600], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7541,new cljs.core.Keyword(null,"col","col",-1959363084),column_7591,new cljs.core.Keyword(null,"name","name",1843675177),name_7601], null));
});})(seq__7431_7593,chunk__7432_7594,count__7433_7595,i__7434_7596,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7437_7597,map__7437_7598__$1,gline_7599,gcol_7600,name_7601,vec__7428_7590,column_7591,column_info_7592,seq__7391_7584__$1,temp__5720__auto___7583__$1,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted))
,cljs.core.sorted_map.call(null)));


var G__7602 = seq__7431_7593;
var G__7603 = chunk__7432_7594;
var G__7604 = count__7433_7595;
var G__7605 = (i__7434_7596 + (1));
seq__7431_7593 = G__7602;
chunk__7432_7594 = G__7603;
count__7433_7595 = G__7604;
i__7434_7596 = G__7605;
continue;
} else {
var temp__5720__auto___7606__$2 = cljs.core.seq.call(null,seq__7431_7593);
if(temp__5720__auto___7606__$2){
var seq__7431_7607__$1 = temp__5720__auto___7606__$2;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7431_7607__$1)){
var c__2045__auto___7608 = cljs.core.chunk_first.call(null,seq__7431_7607__$1);
var G__7609 = cljs.core.chunk_rest.call(null,seq__7431_7607__$1);
var G__7610 = c__2045__auto___7608;
var G__7611 = cljs.core.count.call(null,c__2045__auto___7608);
var G__7612 = (0);
seq__7431_7593 = G__7609;
chunk__7432_7594 = G__7610;
count__7433_7595 = G__7611;
i__7434_7596 = G__7612;
continue;
} else {
var map__7438_7613 = cljs.core.first.call(null,seq__7431_7607__$1);
var map__7438_7614__$1 = cljs.core.__destructure_map.call(null,map__7438_7613);
var gline_7615 = cljs.core.get.call(null,map__7438_7614__$1,new cljs.core.Keyword(null,"gline","gline",-1086242431));
var gcol_7616 = cljs.core.get.call(null,map__7438_7614__$1,new cljs.core.Keyword(null,"gcol","gcol",309250807));
var name_7617 = cljs.core.get.call(null,map__7438_7614__$1,new cljs.core.Keyword(null,"name","name",1843675177));
cljs.core.swap_BANG_.call(null,inverted,cljs.core.update_in,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gline_7615], null),cljs.core.fnil.call(null,((function (seq__7431_7593,chunk__7432_7594,count__7433_7595,i__7434_7596,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7438_7613,map__7438_7614__$1,gline_7615,gcol_7616,name_7617,seq__7431_7607__$1,temp__5720__auto___7606__$2,vec__7428_7590,column_7591,column_info_7592,seq__7391_7584__$1,temp__5720__auto___7583__$1,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted){
return (function (columns__$1){
return cljs.core.update_in.call(null,columns__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [gcol_7616], null),cljs.core.fnil.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",212345235),line_7541,new cljs.core.Keyword(null,"col","col",-1959363084),column_7591,new cljs.core.Keyword(null,"name","name",1843675177),name_7617], null));
});})(seq__7431_7593,chunk__7432_7594,count__7433_7595,i__7434_7596,seq__7391_7543,chunk__7392_7544,count__7393_7545,i__7394_7546,seq__7231_7439,chunk__7232_7440,count__7233_7441,i__7234_7442,map__7438_7613,map__7438_7614__$1,gline_7615,gcol_7616,name_7617,seq__7431_7607__$1,temp__5720__auto___7606__$2,vec__7428_7590,column_7591,column_info_7592,seq__7391_7584__$1,temp__5720__auto___7583__$1,vec__7388_7540,line_7541,columns_7542,seq__7231_7534__$1,temp__5720__auto___7533,inverted))
,cljs.core.sorted_map.call(null)));


var G__7618 = cljs.core.next.call(null,seq__7431_7607__$1);
var G__7619 = null;
var G__7620 = (0);
var G__7621 = (0);
seq__7431_7593 = G__7618;
chunk__7432_7594 = G__7619;
count__7433_7595 = G__7620;
i__7434_7596 = G__7621;
continue;
}
} else {
}
}
break;
}


var G__7622 = cljs.core.next.call(null,seq__7391_7584__$1);
var G__7623 = null;
var G__7624 = (0);
var G__7625 = (0);
seq__7391_7543 = G__7622;
chunk__7392_7544 = G__7623;
count__7393_7545 = G__7624;
i__7394_7546 = G__7625;
continue;
}
} else {
}
}
break;
}


var G__7626 = cljs.core.next.call(null,seq__7231_7534__$1);
var G__7627 = null;
var G__7628 = (0);
var G__7629 = (0);
seq__7231_7439 = G__7626;
chunk__7232_7440 = G__7627;
count__7233_7441 = G__7628;
i__7234_7442 = G__7629;
continue;
}
} else {
}
}
break;
}

return cljs.core.deref.call(null,inverted);
});
