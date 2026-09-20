// Compiled by ClojureScript 1.12.146 {:target :default, :optimizations :simple}
goog.provide('cljs.analyzer.impl.namespaces');
goog.require('cljs.core');
/**
 * Given a libspec return a map of :as-alias alias, if was present. Return the
 * libspec with :as-alias elided. If the libspec was *only* :as-alias do not
 * return it.
 */
cljs.analyzer.impl.namespaces.check_and_remove_as_alias = (function cljs$analyzer$impl$namespaces$check_and_remove_as_alias(libspec){
if((((libspec instanceof cljs.core.Symbol)) || ((libspec instanceof cljs.core.Keyword)))){
return new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"libspec","libspec",1228503756),libspec], null);
} else {
var vec__5247 = libspec;
var seq__5248 = cljs.core.seq.call(null,vec__5247);
var first__5249 = cljs.core.first.call(null,seq__5248);
var seq__5248__$1 = cljs.core.next.call(null,seq__5248);
var lib = first__5249;
var spec = seq__5248__$1;
var libspec__$1 = vec__5247;
var vec__5250 = cljs.core.split_with.call(null,cljs.core.complement.call(null,new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"as-alias","as-alias",82482467),null], null), null)),spec);
var pre_spec = cljs.core.nth.call(null,vec__5250,(0),null);
var vec__5253 = cljs.core.nth.call(null,vec__5250,(1),null);
var seq__5254 = cljs.core.seq.call(null,vec__5253);
var first__5255 = cljs.core.first.call(null,seq__5254);
var seq__5254__$1 = cljs.core.next.call(null,seq__5254);
var _ = first__5255;
var first__5255__$1 = cljs.core.first.call(null,seq__5254__$1);
var seq__5254__$2 = cljs.core.next.call(null,seq__5254__$1);
var alias = first__5255__$1;
var post_spec = seq__5254__$2;
var post = vec__5253;
if(cljs.core.seq.call(null,post)){
var libspec_SINGLEQUOTE_ = cljs.core.into.call(null,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [lib], null),cljs.core.concat.call(null,pre_spec,post_spec));
if((alias instanceof cljs.core.Symbol)){
} else {
throw (new Error((""+"Assert failed: "+cljs.core.str.cljs$core$IFn$_invoke$arity$1((""+":as-alias must be followed by a symbol, got: "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(alias)))+"\n"+"(symbol? alias)")));
}

var G__5256 = new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"as-alias","as-alias",82482467),cljs.core.PersistentArrayMap.createAsIfByAssoc([alias,lib])], null);
if((cljs.core.count.call(null,libspec_SINGLEQUOTE_) > (1))){
return cljs.core.assoc.call(null,G__5256,new cljs.core.Keyword(null,"libspec","libspec",1228503756),libspec_SINGLEQUOTE_);
} else {
return G__5256;
}
} else {
return new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"libspec","libspec",1228503756),libspec__$1], null);
}
}
});
cljs.analyzer.impl.namespaces.check_as_alias_duplicates = (function cljs$analyzer$impl$namespaces$check_as_alias_duplicates(as_aliases,new_as_aliases){
var seq__5257 = cljs.core.seq.call(null,new_as_aliases);
var chunk__5258 = null;
var count__5259 = (0);
var i__5260 = (0);
while(true){
if((i__5260 < count__5259)){
var vec__5267 = cljs.core._nth.call(null,chunk__5258,i__5260);
var alias = cljs.core.nth.call(null,vec__5267,(0),null);
var _ = cljs.core.nth.call(null,vec__5267,(1),null);
if((!(cljs.core.contains_QMARK_.call(null,as_aliases,alias)))){
} else {
throw (new Error((""+"Assert failed: "+cljs.core.str.cljs$core$IFn$_invoke$arity$1((""+"Duplicate :as-alias "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(alias)+", already in use for lib "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.get.call(null,as_aliases,alias))))+"\n"+"(not (contains? as-aliases alias))")));
}


var G__5273 = seq__5257;
var G__5274 = chunk__5258;
var G__5275 = count__5259;
var G__5276 = (i__5260 + (1));
seq__5257 = G__5273;
chunk__5258 = G__5274;
count__5259 = G__5275;
i__5260 = G__5276;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__5257);
if(temp__5720__auto__){
var seq__5257__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__5257__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__5257__$1);
var G__5277 = cljs.core.chunk_rest.call(null,seq__5257__$1);
var G__5278 = c__2045__auto__;
var G__5279 = cljs.core.count.call(null,c__2045__auto__);
var G__5280 = (0);
seq__5257 = G__5277;
chunk__5258 = G__5278;
count__5259 = G__5279;
i__5260 = G__5280;
continue;
} else {
var vec__5270 = cljs.core.first.call(null,seq__5257__$1);
var alias = cljs.core.nth.call(null,vec__5270,(0),null);
var _ = cljs.core.nth.call(null,vec__5270,(1),null);
if((!(cljs.core.contains_QMARK_.call(null,as_aliases,alias)))){
} else {
throw (new Error((""+"Assert failed: "+cljs.core.str.cljs$core$IFn$_invoke$arity$1((""+"Duplicate :as-alias "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(alias)+", already in use for lib "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.get.call(null,as_aliases,alias))))+"\n"+"(not (contains? as-aliases alias))")));
}


var G__5281 = cljs.core.next.call(null,seq__5257__$1);
var G__5282 = null;
var G__5283 = (0);
var G__5284 = (0);
seq__5257 = G__5281;
chunk__5258 = G__5282;
count__5259 = G__5283;
i__5260 = G__5284;
continue;
}
} else {
return null;
}
}
break;
}
});
/**
 * Given libspecs, elide all :as-alias. Return a map of :libspecs (filtered)
 * and :as-aliases.
 */
cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs = (function cljs$analyzer$impl$namespaces$elide_aliases_from_libspecs(var_args){
var G__5286 = arguments.length;
switch (G__5286) {
case 1:
return cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.cljs$core$IFn$_invoke$arity$1 = (function (libspecs){
return cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.call(null,libspecs,cljs.core.PersistentArrayMap.EMPTY);
}));

(cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.cljs$core$IFn$_invoke$arity$2 = (function (libspecs,as_aliases){
var ret = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798),as_aliases,new cljs.core.Keyword(null,"libspecs","libspecs",59807195),cljs.core.PersistentVector.EMPTY], null);
return cljs.core.reduce.call(null,(function (ret__$1,libspec){
var map__5287 = cljs.analyzer.impl.namespaces.check_and_remove_as_alias.call(null,libspec);
var map__5287__$1 = cljs.core.__destructure_map.call(null,map__5287);
var as_alias = cljs.core.get.call(null,map__5287__$1,new cljs.core.Keyword(null,"as-alias","as-alias",82482467));
var libspec__$1 = cljs.core.get.call(null,map__5287__$1,new cljs.core.Keyword(null,"libspec","libspec",1228503756));
cljs.analyzer.impl.namespaces.check_as_alias_duplicates.call(null,new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798).cljs$core$IFn$_invoke$arity$1(ret__$1),as_alias);

var G__5288 = ret__$1;
var G__5288__$1 = (cljs.core.truth_(libspec__$1)?cljs.core.update.call(null,G__5288,new cljs.core.Keyword(null,"libspecs","libspecs",59807195),cljs.core.conj,libspec__$1):G__5288);
if(cljs.core.truth_(as_alias)){
return cljs.core.update.call(null,G__5288__$1,new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798),cljs.core.merge,as_alias);
} else {
return G__5288__$1;
}
}),ret,libspecs);
}));

(cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.cljs$lang$maxFixedArity = 2);

cljs.analyzer.impl.namespaces.elide_aliases_from_ns_specs = (function cljs$analyzer$impl$namespaces$elide_aliases_from_ns_specs(ns_specs){

var ret = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798),cljs.core.PersistentArrayMap.EMPTY,new cljs.core.Keyword(null,"libspecs","libspecs",59807195),cljs.core.PersistentVector.EMPTY], null);
return cljs.core.reduce.call(null,(function (p__5290,p__5291){
var map__5292 = p__5290;
var map__5292__$1 = cljs.core.__destructure_map.call(null,map__5292);
var ret__$1 = map__5292__$1;
var as_aliases = cljs.core.get.call(null,map__5292__$1,new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798));
var vec__5293 = p__5291;
var seq__5294 = cljs.core.seq.call(null,vec__5293);
var first__5295 = cljs.core.first.call(null,seq__5294);
var seq__5294__$1 = cljs.core.next.call(null,seq__5294);
var spec_key = first__5295;
var libspecs = seq__5294__$1;
if((!(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"refer-clojure","refer-clojure",813784440),spec_key)))){
var map__5296 = cljs.analyzer.impl.namespaces.elide_aliases_from_libspecs.call(null,libspecs,as_aliases);
var map__5296__$1 = cljs.core.__destructure_map.call(null,map__5296);
var as_aliases__$1 = cljs.core.get.call(null,map__5296__$1,new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798));
var libspecs__$1 = cljs.core.get.call(null,map__5296__$1,new cljs.core.Keyword(null,"libspecs","libspecs",59807195));
var G__5297 = ret__$1;
var G__5297__$1 = (((!(cljs.core.empty_QMARK_.call(null,as_aliases__$1))))?cljs.core.update.call(null,G__5297,new cljs.core.Keyword(null,"as-aliases","as-aliases",1485064798),cljs.core.merge,as_aliases__$1):G__5297);
if((!(cljs.core.empty_QMARK_.call(null,libspecs__$1)))){
return cljs.core.update.call(null,G__5297__$1,new cljs.core.Keyword(null,"libspecs","libspecs",59807195),cljs.core.conj,cljs.core.list_STAR_.call(null,spec_key,libspecs__$1));
} else {
return G__5297__$1;
}
} else {
return cljs.core.update.call(null,ret__$1,new cljs.core.Keyword(null,"libspecs","libspecs",59807195),cljs.core.conj,cljs.core.list_STAR_.call(null,spec_key,libspecs));
}
}),ret,ns_specs);
});
