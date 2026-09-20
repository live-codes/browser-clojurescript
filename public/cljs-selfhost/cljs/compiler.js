// Compiled by ClojureScript 1.12.146 {:target :default, :optimizations :simple}
goog.provide('cljs.compiler');
goog.require('cljs.core');
goog.require('cljs.analyzer');
goog.require('cljs.analyzer.impl');
goog.require('cljs.env');
goog.require('cljs.source_map');
goog.require('cljs.tools.reader');
goog.require('clojure.set');
goog.require('clojure.string');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
cljs.compiler.js_reserved = cljs.analyzer.js_reserved;
cljs.compiler.es5_GT__EQ_ = cljs.core.into.call(null,cljs.core.PersistentHashSet.EMPTY,cljs.core.comp.call(null,cljs.core.mapcat.call(null,(function (lang){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [lang,cljs.core.keyword.call(null,clojure.string.replace.call(null,cljs.core.name.call(null,lang),/^ecmascript/,"es"))], null);
}))),new cljs.core.PersistentVector(null, 13, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"ecmascript5","ecmascript5",342717552),new cljs.core.Keyword(null,"ecmascript5-strict","ecmascript5-strict",888234811),new cljs.core.Keyword(null,"ecmascript6","ecmascript6",723864898),new cljs.core.Keyword(null,"ecmascript6-strict","ecmascript6-strict",-786049555),new cljs.core.Keyword(null,"ecmascript-2015","ecmascript-2015",-902254444),new cljs.core.Keyword(null,"ecmascript6-typed","ecmascript6-typed",-1978203054),new cljs.core.Keyword(null,"ecmascript-2016","ecmascript-2016",471574729),new cljs.core.Keyword(null,"ecmascript-2017","ecmascript-2017",620145058),new cljs.core.Keyword(null,"ecmascript-2018","ecmascript-2018",-811131980),new cljs.core.Keyword(null,"ecmascript-2019","ecmascript-2019",-1872209910),new cljs.core.Keyword(null,"ecmascript-2020","ecmascript-2020",1452286525),new cljs.core.Keyword(null,"ecmascript-2021","ecmascript-2021",-724420359),new cljs.core.Keyword(null,"ecmascript-next","ecmascript-next",-1935155962)], null));
cljs.compiler._STAR_recompiled_STAR_ = null;
cljs.compiler._STAR_inputs_STAR_ = null;
cljs.compiler._STAR_source_map_data_STAR_ = null;
cljs.compiler._STAR_source_map_data_gen_col_STAR_ = null;
cljs.compiler._STAR_lexical_renames_STAR_ = cljs.core.PersistentArrayMap.EMPTY;
cljs.compiler.cljs_reserved_file_names = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, ["deps.cljs",null], null), null);
/**
 * Gets the part up to the first `.` of a namespace.
 * Returns the empty string for nil.
 * Returns the entire string if no `.` in namespace
 */
cljs.compiler.get_first_ns_segment = (function cljs$compiler$get_first_ns_segment(ns){
var ns__$1 = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ns));
var idx = ns__$1.indexOf(".");
if(((-1) === idx)){
return ns__$1;
} else {
return cljs.core.subs.call(null,ns__$1,(0),idx);
}
});
cljs.compiler.find_ns_starts_with = (function cljs$compiler$find_ns_starts_with(needle){
return cljs.core.reduce_kv.call(null,(function (xs,ns,_){
if(cljs.core._EQ_.call(null,needle,cljs.compiler.get_first_ns_segment.call(null,ns))){
return cljs.core.reduced.call(null,needle);
} else {
return null;
}
}),null,new cljs.core.Keyword("cljs.analyzer","namespaces","cljs.analyzer/namespaces",-260788927).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)));
});
cljs.compiler.shadow_depth = (function cljs$compiler$shadow_depth(s){
var map__7632 = s;
var map__7632__$1 = cljs.core.__destructure_map.call(null,map__7632);
var name = cljs.core.get.call(null,map__7632__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var info = cljs.core.get.call(null,map__7632__$1,new cljs.core.Keyword(null,"info","info",-317069002));
var d = (0);
var G__7634 = info;
var map__7635 = G__7634;
var map__7635__$1 = cljs.core.__destructure_map.call(null,map__7635);
var shadow = cljs.core.get.call(null,map__7635__$1,new cljs.core.Keyword(null,"shadow","shadow",873231803));
var d__$1 = d;
var G__7634__$1 = G__7634;
while(true){
var d__$2 = d__$1;
var map__7637 = G__7634__$1;
var map__7637__$1 = cljs.core.__destructure_map.call(null,map__7637);
var shadow__$1 = cljs.core.get.call(null,map__7637__$1,new cljs.core.Keyword(null,"shadow","shadow",873231803));
if(cljs.core.truth_(shadow__$1)){
var G__7638 = (d__$2 + (1));
var G__7639 = shadow__$1;
d__$1 = G__7638;
G__7634__$1 = G__7639;
continue;
} else {
if(cljs.core.truth_(cljs.compiler.find_ns_starts_with.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name))))){
return (d__$2 + (1));
} else {
return d__$2;

}
}
break;
}
});
cljs.compiler.hash_scope = (function cljs$compiler$hash_scope(s){
return cljs.core.hash_combine.call(null,cljs.core._hash.call(null,new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(s)),cljs.compiler.shadow_depth.call(null,s));
});
cljs.compiler.fn_self_name = (function cljs$compiler$fn_self_name(p__7640){
var map__7641 = p__7640;
var map__7641__$1 = cljs.core.__destructure_map.call(null,map__7641);
var name_var = map__7641__$1;
var name = cljs.core.get.call(null,map__7641__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var info = cljs.core.get.call(null,map__7641__$1,new cljs.core.Keyword(null,"info","info",-317069002));
var name__$1 = clojure.string.replace.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name)),"..","_DOT__DOT_");
var map__7642 = info;
var map__7642__$1 = cljs.core.__destructure_map.call(null,map__7642);
var ns = cljs.core.get.call(null,map__7642__$1,new cljs.core.Keyword(null,"ns","ns",441598760));
var fn_scope = cljs.core.get.call(null,map__7642__$1,new cljs.core.Keyword(null,"fn-scope","fn-scope",-865664859));
var scoped_name = cljs.core.apply.call(null,cljs.core.str,cljs.core.interpose.call(null,"_$_",cljs.core.concat.call(null,cljs.core.map.call(null,cljs.core.comp.call(null,cljs.core.str,new cljs.core.Keyword(null,"name","name",1843675177)),fn_scope),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [name__$1], null))));
return cljs.core.symbol.call(null,cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(clojure.string.replace.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ns)),".","$"))+"$"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(scoped_name))));
});
cljs.compiler.munge_reserved = (function cljs$compiler$munge_reserved(reserved){
return (function (s){
if((!((cljs.core.get.call(null,reserved,s) == null)))){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(s)+"$");
} else {
return s;
}
});
});
cljs.compiler.munge = (function cljs$compiler$munge(var_args){
var G__7644 = arguments.length;
switch (G__7644) {
case 1:
return cljs.compiler.munge.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.compiler.munge.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.compiler.munge.cljs$core$IFn$_invoke$arity$1 = (function (s){
return cljs.compiler.munge.call(null,s,cljs.compiler.js_reserved);
}));

(cljs.compiler.munge.cljs$core$IFn$_invoke$arity$2 = (function (s,reserved){
if(cljs.analyzer.impl.cljs_map_QMARK_.call(null,s)){
var name_var = s;
var name = new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(name_var);
var field = new cljs.core.Keyword(null,"field","field",-1302436500).cljs$core$IFn$_invoke$arity$1(name_var);
var info = new cljs.core.Keyword(null,"info","info",-317069002).cljs$core$IFn$_invoke$arity$1(name_var);
if((!((new cljs.core.Keyword(null,"fn-self-name","fn-self-name",1461143531).cljs$core$IFn$_invoke$arity$1(info) == null)))){
return cljs.compiler.fn_self_name.call(null,s);
} else {
var depth = cljs.compiler.shadow_depth.call(null,s);
var code = cljs.compiler.hash_scope.call(null,s);
var renamed = cljs.core.get.call(null,cljs.compiler._STAR_lexical_renames_STAR_,code);
var name__$1 = ((field === true)?(""+"self__."+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name)):(((!((renamed == null))))?renamed:name
));
var munged_name = cljs.compiler.munge.call(null,name__$1,reserved);
if(((field === true) || ((depth === (0))))){
return munged_name;
} else {
return cljs.core.symbol.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(munged_name)+"__$"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(depth)));
}
}
} else {
var ss = clojure.string.replace.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(s)),"..","_DOT__DOT_");
var ss__$1 = clojure.string.replace.call(null,ss,(new RegExp("\\/(.)")),".$1");
var rf = cljs.compiler.munge_reserved.call(null,reserved);
var ss__$2 = cljs.core.map.call(null,rf,clojure.string.split.call(null,ss__$1,/\./));
var ss__$3 = clojure.string.join.call(null,".",ss__$2);
var ms = cljs.core.munge_str.call(null,ss__$3);
if((s instanceof cljs.core.Symbol)){
return cljs.core.symbol.call(null,ms);
} else {
return ms;
}
}
}));

(cljs.compiler.munge.cljs$lang$maxFixedArity = 2);

cljs.compiler.comma_sep = (function cljs$compiler$comma_sep(xs){
return cljs.core.interpose.call(null,",",xs);
});
cljs.compiler.escape_char = (function cljs$compiler$escape_char(c){
var cp = goog.string.hashCode(c);
var G__7646 = cp;
switch (G__7646) {
case (34):
return "\\\"";

break;
case (92):
return "\\\\";

break;
case (8):
return "\\b";

break;
case (12):
return "\\f";

break;
case (10):
return "\\n";

break;
case (13):
return "\\r";

break;
case (9):
return "\\t";

break;
default:
if(((((31) < cp)) && ((cp < (127))))){
return c;
} else {
var unpadded = cp.toString((16));
var pad = cljs.core.subs.call(null,"0000",unpadded.length);
return (""+"\\u"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(pad)+cljs.core.str.cljs$core$IFn$_invoke$arity$1(unpadded));
}

}
});
cljs.compiler.escape_string = (function cljs$compiler$escape_string(s){
var sb = (new goog.string.StringBuffer());
var seq__7648_7652 = cljs.core.seq.call(null,s);
var chunk__7649_7653 = null;
var count__7650_7654 = (0);
var i__7651_7655 = (0);
while(true){
if((i__7651_7655 < count__7650_7654)){
var c_7656 = cljs.core._nth.call(null,chunk__7649_7653,i__7651_7655);
sb.append(cljs.compiler.escape_char.call(null,c_7656));


var G__7657 = seq__7648_7652;
var G__7658 = chunk__7649_7653;
var G__7659 = count__7650_7654;
var G__7660 = (i__7651_7655 + (1));
seq__7648_7652 = G__7657;
chunk__7649_7653 = G__7658;
count__7650_7654 = G__7659;
i__7651_7655 = G__7660;
continue;
} else {
var temp__5720__auto___7661 = cljs.core.seq.call(null,seq__7648_7652);
if(temp__5720__auto___7661){
var seq__7648_7662__$1 = temp__5720__auto___7661;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7648_7662__$1)){
var c__2045__auto___7663 = cljs.core.chunk_first.call(null,seq__7648_7662__$1);
var G__7664 = cljs.core.chunk_rest.call(null,seq__7648_7662__$1);
var G__7665 = c__2045__auto___7663;
var G__7666 = cljs.core.count.call(null,c__2045__auto___7663);
var G__7667 = (0);
seq__7648_7652 = G__7664;
chunk__7649_7653 = G__7665;
count__7650_7654 = G__7666;
i__7651_7655 = G__7667;
continue;
} else {
var c_7668 = cljs.core.first.call(null,seq__7648_7662__$1);
sb.append(cljs.compiler.escape_char.call(null,c_7668));


var G__7669 = cljs.core.next.call(null,seq__7648_7662__$1);
var G__7670 = null;
var G__7671 = (0);
var G__7672 = (0);
seq__7648_7652 = G__7669;
chunk__7649_7653 = G__7670;
count__7650_7654 = G__7671;
i__7651_7655 = G__7672;
continue;
}
} else {
}
}
break;
}

return sb.toString();
});
cljs.compiler.wrap_in_double_quotes = (function cljs$compiler$wrap_in_double_quotes(x){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\"")+cljs.core.str.cljs$core$IFn$_invoke$arity$1(x)+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\""));
});
if((typeof cljs !== 'undefined') && (typeof cljs.compiler !== 'undefined') && (typeof cljs.compiler.emit_STAR_ !== 'undefined')){
} else {
cljs.compiler.emit_STAR_ = (function (){var method_table__2119__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var prefer_table__2120__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var method_cache__2121__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var cached_hierarchy__2122__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var hierarchy__2123__auto__ = cljs.core.get.call(null,cljs.core.PersistentArrayMap.EMPTY,new cljs.core.Keyword(null,"hierarchy","hierarchy",-1053470341),cljs.core.get_global_hierarchy.call(null));
return (new cljs.core.MultiFn(cljs.core.symbol.call(null,"cljs.compiler","emit*"),new cljs.core.Keyword(null,"op","op",-1882987955),new cljs.core.Keyword(null,"default","default",-1987822328),hierarchy__2123__auto__,method_table__2119__auto__,prefer_table__2120__auto__,method_cache__2121__auto__,cached_hierarchy__2122__auto__));
})();
}
cljs.compiler.emit = (function cljs$compiler$emit(ast){
if(cljs.core.truth_(cljs.compiler._STAR_source_map_data_STAR_)){
var map__7673_7676 = ast;
var map__7673_7677__$1 = cljs.core.__destructure_map.call(null,map__7673_7676);
var env_7678 = cljs.core.get.call(null,map__7673_7677__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
if(cljs.core.truth_(new cljs.core.Keyword(null,"line","line",212345235).cljs$core$IFn$_invoke$arity$1(env_7678))){
var map__7674_7679 = env_7678;
var map__7674_7680__$1 = cljs.core.__destructure_map.call(null,map__7674_7679);
var line_7681 = cljs.core.get.call(null,map__7674_7680__$1,new cljs.core.Keyword(null,"line","line",212345235));
var column_7682 = cljs.core.get.call(null,map__7674_7680__$1,new cljs.core.Keyword(null,"column","column",2078222095));
cljs.core.swap_BANG_.call(null,cljs.compiler._STAR_source_map_data_STAR_,(function (m){
var minfo = (function (){var G__7675 = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"gcol","gcol",309250807),new cljs.core.Keyword(null,"gen-col","gen-col",1901918303).cljs$core$IFn$_invoke$arity$1(m),new cljs.core.Keyword(null,"gline","gline",-1086242431),new cljs.core.Keyword(null,"gen-line","gen-line",589592125).cljs$core$IFn$_invoke$arity$1(m)], null);
if(cljs.core.truth_(new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"binding","binding",539932593),null,new cljs.core.Keyword(null,"var","var",-769682797),null,new cljs.core.Keyword(null,"js-var","js-var",-1177899142),null,new cljs.core.Keyword(null,"local","local",-1497766724),null], null), null).call(null,new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(ast)))){
return cljs.core.assoc.call(null,G__7675,new cljs.core.Keyword(null,"name","name",1843675177),(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"info","info",-317069002).cljs$core$IFn$_invoke$arity$1(ast)))));
} else {
return G__7675;
}
})();
return cljs.core.update_in.call(null,m,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"source-map","source-map",1706252311),(line_7681 - (1))], null),cljs.core.fnil.call(null,(function (line__$1){
return cljs.core.update_in.call(null,line__$1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(cljs.core.truth_(column_7682)?(column_7682 - (1)):(0))], null),cljs.core.fnil.call(null,(function (column__$1){
return cljs.core.conj.call(null,column__$1,minfo);
}),cljs.core.PersistentVector.EMPTY));
}),cljs.core.sorted_map.call(null)));
}));
} else {
}
} else {
}

return cljs.compiler.emit_STAR_.call(null,ast);
});
cljs.compiler.emits = (function cljs$compiler$emits(var_args){
var G__7691 = arguments.length;
switch (G__7691) {
case 0:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$0();

break;
case 1:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 4:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
case 5:
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$5((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]));

break;
default:
var args_arr__2273__auto__ = [];
var len__2248__auto___7698 = arguments.length;
var i__2249__auto___7699 = (0);
while(true){
if((i__2249__auto___7699 < len__2248__auto___7698)){
args_arr__2273__auto__.push((arguments[i__2249__auto___7699]));

var G__7700 = (i__2249__auto___7699 + (1));
i__2249__auto___7699 = G__7700;
continue;
} else {
}
break;
}

var argseq__2274__auto__ = ((((5) < args_arr__2273__auto__.length))?(new cljs.core.IndexedSeq(args_arr__2273__auto__.slice((5)),(0),null)):null);
return cljs.compiler.emits.cljs$core$IFn$_invoke$arity$variadic((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]),argseq__2274__auto__);

}
});

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$0 = (function (){
return null;
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$1 = (function (a){
if((a == null)){
} else {
if(cljs.analyzer.impl.cljs_map_QMARK_.call(null,a)){
cljs.compiler.emit.call(null,a);
} else {
if(cljs.analyzer.impl.cljs_seq_QMARK_.call(null,a)){
cljs.core.apply.call(null,cljs.compiler.emits,a);
} else {
if(typeof a === 'function'){
a.call(null);
} else {
var s_7701 = (function (){var G__7692 = a;
if((!(typeof a === 'string'))){
return G__7692.toString();
} else {
return G__7692;
}
})();
var temp__5724__auto___7702 = cljs.compiler._STAR_source_map_data_STAR_;
if((temp__5724__auto___7702 == null)){
} else {
var sm_data_7703 = temp__5724__auto___7702;
cljs.core.swap_BANG_.call(null,sm_data_7703,cljs.core.update,new cljs.core.Keyword(null,"gen-col","gen-col",1901918303),(function (p1__7683_SHARP_){
return (p1__7683_SHARP_ + s_7701.length);
}));
}

cljs.core.print.call(null,s_7701);

}
}
}
}

return null;
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$2 = (function (a,b){
cljs.compiler.emits.call(null,a);

return cljs.compiler.emits.call(null,b);
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$3 = (function (a,b,c){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

return cljs.compiler.emits.call(null,c);
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$4 = (function (a,b,c,d){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

return cljs.compiler.emits.call(null,d);
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$5 = (function (a,b,c,d,e){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

cljs.compiler.emits.call(null,d);

return cljs.compiler.emits.call(null,e);
}));

(cljs.compiler.emits.cljs$core$IFn$_invoke$arity$variadic = (function (a,b,c,d,e,xs){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

cljs.compiler.emits.call(null,d);

cljs.compiler.emits.call(null,e);

var seq__7693 = cljs.core.seq.call(null,xs);
var chunk__7694 = null;
var count__7695 = (0);
var i__7696 = (0);
while(true){
if((i__7696 < count__7695)){
var x = cljs.core._nth.call(null,chunk__7694,i__7696);
cljs.compiler.emits.call(null,x);


var G__7704 = seq__7693;
var G__7705 = chunk__7694;
var G__7706 = count__7695;
var G__7707 = (i__7696 + (1));
seq__7693 = G__7704;
chunk__7694 = G__7705;
count__7695 = G__7706;
i__7696 = G__7707;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__7693);
if(temp__5720__auto__){
var seq__7693__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7693__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__7693__$1);
var G__7708 = cljs.core.chunk_rest.call(null,seq__7693__$1);
var G__7709 = c__2045__auto__;
var G__7710 = cljs.core.count.call(null,c__2045__auto__);
var G__7711 = (0);
seq__7693 = G__7708;
chunk__7694 = G__7709;
count__7695 = G__7710;
i__7696 = G__7711;
continue;
} else {
var x = cljs.core.first.call(null,seq__7693__$1);
cljs.compiler.emits.call(null,x);


var G__7712 = cljs.core.next.call(null,seq__7693__$1);
var G__7713 = null;
var G__7714 = (0);
var G__7715 = (0);
seq__7693 = G__7712;
chunk__7694 = G__7713;
count__7695 = G__7714;
i__7696 = G__7715;
continue;
}
} else {
return null;
}
}
break;
}
}));

/** @this {Function} */
(cljs.compiler.emits.cljs$lang$applyTo = (function (seq7685){
var G__7686 = cljs.core.first.call(null,seq7685);
var seq7685__$1 = cljs.core.next.call(null,seq7685);
var G__7687 = cljs.core.first.call(null,seq7685__$1);
var seq7685__$2 = cljs.core.next.call(null,seq7685__$1);
var G__7688 = cljs.core.first.call(null,seq7685__$2);
var seq7685__$3 = cljs.core.next.call(null,seq7685__$2);
var G__7689 = cljs.core.first.call(null,seq7685__$3);
var seq7685__$4 = cljs.core.next.call(null,seq7685__$3);
var G__7690 = cljs.core.first.call(null,seq7685__$4);
var seq7685__$5 = cljs.core.next.call(null,seq7685__$4);
var self__2233__auto__ = this;
return self__2233__auto__.cljs$core$IFn$_invoke$arity$variadic(G__7686,G__7687,G__7688,G__7689,G__7690,seq7685__$5);
}));

(cljs.compiler.emits.cljs$lang$maxFixedArity = (5));

cljs.compiler._emitln = (function cljs$compiler$_emitln(){
cljs.core.newline.call(null);

if(cljs.core.truth_(cljs.compiler._STAR_source_map_data_STAR_)){
cljs.core.swap_BANG_.call(null,cljs.compiler._STAR_source_map_data_STAR_,(function (p__7716){
var map__7717 = p__7716;
var map__7717__$1 = cljs.core.__destructure_map.call(null,map__7717);
var m = map__7717__$1;
var gen_line = cljs.core.get.call(null,map__7717__$1,new cljs.core.Keyword(null,"gen-line","gen-line",589592125));
return cljs.core.assoc.call(null,m,new cljs.core.Keyword(null,"gen-line","gen-line",589592125),(gen_line + (1)),new cljs.core.Keyword(null,"gen-col","gen-col",1901918303),(0));
}));
} else {
}

return null;
});
cljs.compiler.emitln = (function cljs$compiler$emitln(var_args){
var G__7725 = arguments.length;
switch (G__7725) {
case 0:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$0();

break;
case 1:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 4:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
case 5:
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$5((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]));

break;
default:
var args_arr__2273__auto__ = [];
var len__2248__auto___7731 = arguments.length;
var i__2249__auto___7732 = (0);
while(true){
if((i__2249__auto___7732 < len__2248__auto___7731)){
args_arr__2273__auto__.push((arguments[i__2249__auto___7732]));

var G__7733 = (i__2249__auto___7732 + (1));
i__2249__auto___7732 = G__7733;
continue;
} else {
}
break;
}

var argseq__2274__auto__ = ((((5) < args_arr__2273__auto__.length))?(new cljs.core.IndexedSeq(args_arr__2273__auto__.slice((5)),(0),null)):null);
return cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$variadic((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]),argseq__2274__auto__);

}
});

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$0 = (function (){
return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$1 = (function (a){
cljs.compiler.emits.call(null,a);

return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$2 = (function (a,b){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$3 = (function (a,b,c){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$4 = (function (a,b,c,d){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

cljs.compiler.emits.call(null,d);

return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$5 = (function (a,b,c,d,e){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

cljs.compiler.emits.call(null,d);

cljs.compiler.emits.call(null,e);

return cljs.compiler._emitln.call(null);
}));

(cljs.compiler.emitln.cljs$core$IFn$_invoke$arity$variadic = (function (a,b,c,d,e,xs){
cljs.compiler.emits.call(null,a);

cljs.compiler.emits.call(null,b);

cljs.compiler.emits.call(null,c);

cljs.compiler.emits.call(null,d);

cljs.compiler.emits.call(null,e);

var seq__7726_7734 = cljs.core.seq.call(null,xs);
var chunk__7727_7735 = null;
var count__7728_7736 = (0);
var i__7729_7737 = (0);
while(true){
if((i__7729_7737 < count__7728_7736)){
var x_7738 = cljs.core._nth.call(null,chunk__7727_7735,i__7729_7737);
cljs.compiler.emits.call(null,x_7738);


var G__7739 = seq__7726_7734;
var G__7740 = chunk__7727_7735;
var G__7741 = count__7728_7736;
var G__7742 = (i__7729_7737 + (1));
seq__7726_7734 = G__7739;
chunk__7727_7735 = G__7740;
count__7728_7736 = G__7741;
i__7729_7737 = G__7742;
continue;
} else {
var temp__5720__auto___7743 = cljs.core.seq.call(null,seq__7726_7734);
if(temp__5720__auto___7743){
var seq__7726_7744__$1 = temp__5720__auto___7743;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7726_7744__$1)){
var c__2045__auto___7745 = cljs.core.chunk_first.call(null,seq__7726_7744__$1);
var G__7746 = cljs.core.chunk_rest.call(null,seq__7726_7744__$1);
var G__7747 = c__2045__auto___7745;
var G__7748 = cljs.core.count.call(null,c__2045__auto___7745);
var G__7749 = (0);
seq__7726_7734 = G__7746;
chunk__7727_7735 = G__7747;
count__7728_7736 = G__7748;
i__7729_7737 = G__7749;
continue;
} else {
var x_7750 = cljs.core.first.call(null,seq__7726_7744__$1);
cljs.compiler.emits.call(null,x_7750);


var G__7751 = cljs.core.next.call(null,seq__7726_7744__$1);
var G__7752 = null;
var G__7753 = (0);
var G__7754 = (0);
seq__7726_7734 = G__7751;
chunk__7727_7735 = G__7752;
count__7728_7736 = G__7753;
i__7729_7737 = G__7754;
continue;
}
} else {
}
}
break;
}

return cljs.compiler._emitln.call(null);
}));

/** @this {Function} */
(cljs.compiler.emitln.cljs$lang$applyTo = (function (seq7719){
var G__7720 = cljs.core.first.call(null,seq7719);
var seq7719__$1 = cljs.core.next.call(null,seq7719);
var G__7721 = cljs.core.first.call(null,seq7719__$1);
var seq7719__$2 = cljs.core.next.call(null,seq7719__$1);
var G__7722 = cljs.core.first.call(null,seq7719__$2);
var seq7719__$3 = cljs.core.next.call(null,seq7719__$2);
var G__7723 = cljs.core.first.call(null,seq7719__$3);
var seq7719__$4 = cljs.core.next.call(null,seq7719__$3);
var G__7724 = cljs.core.first.call(null,seq7719__$4);
var seq7719__$5 = cljs.core.next.call(null,seq7719__$4);
var self__2233__auto__ = this;
return self__2233__auto__.cljs$core$IFn$_invoke$arity$variadic(G__7720,G__7721,G__7722,G__7723,G__7724,seq7719__$5);
}));

(cljs.compiler.emitln.cljs$lang$maxFixedArity = (5));

cljs.compiler.emit_str = (function cljs$compiler$emit_str(expr){
var sb__2167__auto__ = (new goog.string.StringBuffer());
var _STAR_print_newline_STAR__orig_val__7755_7759 = cljs.core._STAR_print_newline_STAR_;
var _STAR_print_fn_STAR__orig_val__7756_7760 = cljs.core._STAR_print_fn_STAR_;
var _STAR_print_newline_STAR__temp_val__7757_7761 = true;
var _STAR_print_fn_STAR__temp_val__7758_7762 = (function (x__2168__auto__){
return sb__2167__auto__.append(x__2168__auto__);
});
(cljs.core._STAR_print_newline_STAR_ = _STAR_print_newline_STAR__temp_val__7757_7761);

(cljs.core._STAR_print_fn_STAR_ = _STAR_print_fn_STAR__temp_val__7758_7762);

try{cljs.compiler.emit.call(null,expr);
}finally {(cljs.core._STAR_print_fn_STAR_ = _STAR_print_fn_STAR__orig_val__7756_7760);

(cljs.core._STAR_print_newline_STAR_ = _STAR_print_newline_STAR__orig_val__7755_7759);
}
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(sb__2167__auto__));
});
if((typeof cljs !== 'undefined') && (typeof cljs.compiler !== 'undefined') && (typeof cljs.compiler.emit_constant_STAR_ !== 'undefined')){
} else {
cljs.compiler.emit_constant_STAR_ = (function (){var method_table__2119__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var prefer_table__2120__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var method_cache__2121__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var cached_hierarchy__2122__auto__ = cljs.core.atom.call(null,cljs.core.PersistentArrayMap.EMPTY);
var hierarchy__2123__auto__ = cljs.core.get.call(null,cljs.core.PersistentArrayMap.EMPTY,new cljs.core.Keyword(null,"hierarchy","hierarchy",-1053470341),cljs.core.get_global_hierarchy.call(null));
return (new cljs.core.MultiFn(cljs.core.symbol.call(null,"cljs.compiler","emit-constant*"),cljs.core.type,new cljs.core.Keyword(null,"default","default",-1987822328),hierarchy__2123__auto__,method_table__2119__auto__,prefer_table__2120__auto__,method_cache__2121__auto__,cached_hierarchy__2122__auto__));
})();
}









cljs.compiler.all_distinct_QMARK_ = (function cljs$compiler$all_distinct_QMARK_(xs){
return cljs.core.apply.call(null,cljs.core.distinct_QMARK_,xs);
});
cljs.compiler.emit_constant_no_meta = (function cljs$compiler$emit_constant_no_meta(x){
if(cljs.analyzer.impl.cljs_seq_QMARK_.call(null,x)){
return cljs.compiler.emit_list.call(null,x,cljs.compiler.emit_constants_comma_sep);
} else {
if(cljs.core.record_QMARK_.call(null,x)){
var vec__7763 = cljs.analyzer.record_ns_PLUS_name.call(null,x);
var ns = cljs.core.nth.call(null,vec__7763,(0),null);
var name = cljs.core.nth.call(null,vec__7763,(1),null);
return cljs.compiler.emit_record_value.call(null,ns,name,(function (){
return cljs.compiler.emit_constant.call(null,cljs.core.into.call(null,cljs.core.PersistentArrayMap.EMPTY,x));
}));
} else {
if(cljs.analyzer.impl.cljs_map_QMARK_.call(null,x)){
return cljs.compiler.emit_map.call(null,cljs.core.keys.call(null,x),cljs.core.vals.call(null,x),cljs.compiler.emit_constants_comma_sep,cljs.compiler.all_distinct_QMARK_);
} else {
if(cljs.analyzer.impl.cljs_vector_QMARK_.call(null,x)){
return cljs.compiler.emit_vector.call(null,x,cljs.compiler.emit_constants_comma_sep);
} else {
if(cljs.analyzer.impl.cljs_set_QMARK_.call(null,x)){
return cljs.compiler.emit_set.call(null,x,cljs.compiler.emit_constants_comma_sep,cljs.compiler.all_distinct_QMARK_);
} else {
return cljs.compiler.emit_constant_STAR_.call(null,x);

}
}
}
}
}
});
cljs.compiler.emit_constant = (function cljs$compiler$emit_constant(v){
var m = cljs.analyzer.elide_irrelevant_meta.call(null,cljs.core.meta.call(null,v));
if((!((cljs.core.seq.call(null,m) == null)))){
return cljs.compiler.emit_with_meta.call(null,(function (){
return cljs.compiler.emit_constant_no_meta.call(null,v);
}),(function (){
return cljs.compiler.emit_constant_no_meta.call(null,m);
}));
} else {
return cljs.compiler.emit_constant_no_meta.call(null,v);
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,new cljs.core.Keyword(null,"default","default",-1987822328),(function (x){
throw cljs.core.ex_info.call(null,(""+"failed compiling constant: "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(x)+"; "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.pr_str.call(null,cljs.core.type.call(null,x)))+" is not a valid ClojureScript constant."),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"constant","constant",-379609303),x,new cljs.core.Keyword(null,"type","type",1174270348),cljs.core.type.call(null,x),new cljs.core.Keyword("clojure.error","phase","clojure.error/phase",275140358),new cljs.core.Keyword(null,"compilation","compilation",-1328774561)], null));
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,null,(function (x){
return cljs.compiler.emits.call(null,"null");
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,Number,(function (x){
if(isNaN(x)){
return cljs.compiler.emits.call(null,"NaN");
} else {
if((!(isFinite(x)))){
return cljs.compiler.emits.call(null,(((x > (0)))?"Infinity":"-Infinity"));
} else {
if((((x === (0))) && ((((1) / x) < (0))))){
return cljs.compiler.emits.call(null,"(-0)");
} else {
return cljs.compiler.emits.call(null,"(",x,")");

}
}
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,String,(function (x){
return cljs.compiler.emits.call(null,cljs.compiler.wrap_in_double_quotes.call(null,cljs.compiler.escape_string.call(null,x)));
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,Boolean,(function (x){
return cljs.compiler.emits.call(null,(cljs.core.truth_(x)?"true":"false"));
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,RegExp,(function (x){
if(cljs.core._EQ_.call(null,"",(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(x)))){
return cljs.compiler.emits.call(null,"(new RegExp(\"\"))");
} else {
var vec__7766 = cljs.core.re_find.call(null,/^(?:\(\?([idmsux]*)\))?(.*)/,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(x)));
var _ = cljs.core.nth.call(null,vec__7766,(0),null);
var flags = cljs.core.nth.call(null,vec__7766,(1),null);
var pattern = cljs.core.nth.call(null,vec__7766,(2),null);
return cljs.compiler.emits.call(null,pattern);
}
}));
cljs.compiler.emits_keyword = (function cljs$compiler$emits_keyword(kw){
var ns = cljs.core.namespace.call(null,kw);
var name = cljs.core.name.call(null,kw);
cljs.compiler.emits.call(null,"new cljs.core.Keyword(");

cljs.compiler.emit_constant.call(null,ns);

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,name);

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,(cljs.core.truth_(ns)?(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ns)+"/"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name)):name));

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,cljs.core.hash.call(null,kw));

return cljs.compiler.emits.call(null,")");
});
cljs.compiler.emits_symbol = (function cljs$compiler$emits_symbol(sym){
var ns = cljs.core.namespace.call(null,sym);
var name = cljs.core.name.call(null,sym);
var symstr = (((!((ns == null))))?(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ns)+"/"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name)):name);
cljs.compiler.emits.call(null,"new cljs.core.Symbol(");

cljs.compiler.emit_constant.call(null,ns);

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,name);

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,symstr);

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,cljs.core.hash.call(null,sym));

cljs.compiler.emits.call(null,",");

cljs.compiler.emit_constant.call(null,null);

return cljs.compiler.emits.call(null,")");
});
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,cljs.core.Keyword,(function (x){
var temp__5718__auto__ = (function (){var and__1511__auto__ = new cljs.core.Keyword(null,"emit-constants","emit-constants",-476585410).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"options","options",99638489).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)));
if(cljs.core.truth_(and__1511__auto__)){
return x.call(null,new cljs.core.Keyword("cljs.analyzer","constant-table","cljs.analyzer/constant-table",-114131889).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)));
} else {
return and__1511__auto__;
}
})();
if(cljs.core.truth_(temp__5718__auto__)){
var value = temp__5718__auto__;
return cljs.compiler.emits.call(null,"cljs.core.",value);
} else {
return cljs.compiler.emits_keyword.call(null,x);
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,cljs.core.Symbol,(function (x){
var temp__5718__auto__ = (function (){var and__1511__auto__ = new cljs.core.Keyword(null,"emit-constants","emit-constants",-476585410).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"options","options",99638489).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)));
if(cljs.core.truth_(and__1511__auto__)){
return x.call(null,new cljs.core.Keyword("cljs.analyzer","constant-table","cljs.analyzer/constant-table",-114131889).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)));
} else {
return and__1511__auto__;
}
})();
if(cljs.core.truth_(temp__5718__auto__)){
var value = temp__5718__auto__;
return cljs.compiler.emits.call(null,"cljs.core.",value);
} else {
return cljs.compiler.emits_symbol.call(null,x);
}
}));
cljs.compiler.emit_constants_comma_sep = (function cljs$compiler$emit_constants_comma_sep(cs){
return (function (){
return cljs.core.doall.call(null,cljs.core.map_indexed.call(null,(function (i,m){
if(cljs.core.even_QMARK_.call(null,i)){
return cljs.compiler.emit_constant.call(null,m);
} else {
return cljs.compiler.emits.call(null,m);
}
}),cljs.compiler.comma_sep.call(null,cs)));
});
});
cljs.compiler.array_map_threshold = (8);
cljs.compiler.emit_inst = (function cljs$compiler$emit_inst(inst_ms){
return cljs.compiler.emits.call(null,"new Date(",inst_ms,")");
});
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,Date,(function (date){
return cljs.compiler.emit_inst.call(null,date.getTime());
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,cljs.core.UUID,(function (uuid){
var uuid_str = uuid.toString();
return cljs.compiler.emits.call(null,"new cljs.core.UUID(\"",uuid_str,"\", ",cljs.core.hash.call(null,uuid_str),")");
}));
cljs.core._add_method.call(null,cljs.compiler.emit_constant_STAR_,cljs.tagged_literals.JSValue,(function (v){
var items = v.val;
if(cljs.core.map_QMARK_.call(null,items)){
return cljs.compiler.emit_js_object.call(null,items,(function (p1__7769_SHARP_){
return (function (){
return cljs.compiler.emit_constant.call(null,p1__7769_SHARP_);
});
}));
} else {
return cljs.compiler.emit_js_array.call(null,items,cljs.compiler.emit_constants_comma_sep);
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"no-op","no-op",-93046065),(function (m){
return null;
}));
cljs.compiler.emit_var = (function cljs$compiler$emit_var(p__7771){
var map__7772 = p__7771;
var map__7772__$1 = cljs.core.__destructure_map.call(null,map__7772);
var ast = map__7772__$1;
var info = cljs.core.get.call(null,map__7772__$1,new cljs.core.Keyword(null,"info","info",-317069002));
var env = cljs.core.get.call(null,map__7772__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var form = cljs.core.get.call(null,map__7772__$1,new cljs.core.Keyword(null,"form","form",-1624062471));
var temp__5718__auto__ = new cljs.core.Keyword(null,"const-expr","const-expr",-1379382292).cljs$core$IFn$_invoke$arity$1(ast);
if(cljs.core.truth_(temp__5718__auto__)){
var const_expr = temp__5718__auto__;
return cljs.compiler.emit.call(null,cljs.core.assoc.call(null,const_expr,new cljs.core.Keyword(null,"env","env",-1815813235),env));
} else {
var map__7773 = cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_);
var map__7773__$1 = cljs.core.__destructure_map.call(null,map__7773);
var cenv = map__7773__$1;
var options = cljs.core.get.call(null,map__7773__$1,new cljs.core.Keyword(null,"options","options",99638489));
var var_name = new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(info);
var info__$1 = ((cljs.core._EQ_.call(null,cljs.core.namespace.call(null,var_name),"js"))?(function (){var js_module_name = cljs.core.get_in.call(null,cenv,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"js-module-index","js-module-index",2072061931),cljs.core.name.call(null,var_name),new cljs.core.Keyword(null,"name","name",1843675177)], null));
var or__1513__auto__ = js_module_name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.name.call(null,var_name);
}
})():info);
if(cljs.core.truth_(new cljs.core.Keyword(null,"binding-form?","binding-form?",1728940169).cljs$core$IFn$_invoke$arity$1(ast))){
return cljs.compiler.emits.call(null,cljs.compiler.munge.call(null,ast));
} else {
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"statement","statement",-32780863),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
return null;
} else {
var reserved = (function (){var G__7774 = cljs.compiler.js_reserved;
if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.compiler.es5_GT__EQ_.call(null,new cljs.core.Keyword(null,"language-out","language-out",334619882).cljs$core$IFn$_invoke$arity$1(options));
if(cljs.core.truth_(and__1511__auto__)){
return (!((cljs.core.namespace.call(null,var_name) == null)));
} else {
return and__1511__auto__;
}
})())){
return clojure.set.difference.call(null,G__7774,cljs.analyzer.es5_allowed);
} else {
return G__7774;
}
})();
var js_module = cljs.core.get_in.call(null,cenv,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"js-namespaces","js-namespaces",-471353612),(function (){var or__1513__auto__ = cljs.core.namespace.call(null,var_name);
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.name.call(null,var_name);
}
})()], null));
var info__$2 = (function (){var G__7775 = info__$1;
if(cljs.core.not_EQ_.call(null,form,new cljs.core.Symbol("js","-Infinity","js/-Infinity",958706333,null))){
return cljs.compiler.munge.call(null,G__7775,reserved);
} else {
return G__7775;
}
})();
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

var G__7776_7777 = new cljs.core.Keyword(null,"module-type","module-type",1392760304).cljs$core$IFn$_invoke$arity$1(js_module);
var G__7776_7778__$1 = (((G__7776_7777 instanceof cljs.core.Keyword))?G__7776_7777.fqn:null);
switch (G__7776_7778__$1) {
case "commonjs":
if(cljs.core.truth_(cljs.core.namespace.call(null,var_name))){
cljs.compiler.emits.call(null,cljs.compiler.munge.call(null,cljs.core.namespace.call(null,var_name),reserved),"[\"default\"].",cljs.compiler.munge.call(null,cljs.core.name.call(null,var_name),reserved));
} else {
cljs.compiler.emits.call(null,cljs.compiler.munge.call(null,cljs.core.name.call(null,var_name),reserved),"[\"default\"]");
}

break;
case "es6":
if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.core.namespace.call(null,var_name);
if(cljs.core.truth_(and__1511__auto__)){
return cljs.core._EQ_.call(null,"default",cljs.core.name.call(null,var_name));
} else {
return and__1511__auto__;
}
})())){
cljs.compiler.emits.call(null,cljs.compiler.munge.call(null,cljs.core.namespace.call(null,var_name),reserved),"[\"default\"]");
} else {
cljs.compiler.emits.call(null,info__$2);
}

break;
default:
cljs.compiler.emits.call(null,info__$2);

}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}
}
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"var","var",-769682797),(function (expr){
return cljs.compiler.emit_var.call(null,expr);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"binding","binding",539932593),(function (expr){
return cljs.compiler.emit_var.call(null,expr);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"js-var","js-var",-1177899142),(function (expr){
return cljs.compiler.emit_var.call(null,expr);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"local","local",-1497766724),(function (expr){
return cljs.compiler.emit_var.call(null,expr);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"the-var","the-var",1428415613),(function (p__7780){
var map__7781 = p__7780;
var map__7781__$1 = cljs.core.__destructure_map.call(null,map__7781);
var arg = map__7781__$1;
var env = cljs.core.get.call(null,map__7781__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var var$ = cljs.core.get.call(null,map__7781__$1,new cljs.core.Keyword(null,"var","var",-769682797));
var sym = cljs.core.get.call(null,map__7781__$1,new cljs.core.Keyword(null,"sym","sym",-1444860305));
var meta = cljs.core.get.call(null,map__7781__$1,new cljs.core.Keyword(null,"meta","meta",1499536964));
if(cljs.analyzer.ast_QMARK_.call(null,sym)){
} else {
throw (new Error("Assert failed: (ana/ast? sym)"));
}

if(cljs.analyzer.ast_QMARK_.call(null,meta)){
} else {
throw (new Error("Assert failed: (ana/ast? meta)"));
}

var map__7782 = new cljs.core.Keyword(null,"info","info",-317069002).cljs$core$IFn$_invoke$arity$1(var$);
var map__7782__$1 = cljs.core.__destructure_map.call(null,map__7782);
var name = cljs.core.get.call(null,map__7782__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"new cljs.core.Var(function(){return ",cljs.compiler.munge.call(null,name),";},",sym,",",meta,")");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.emit_with_meta = (function cljs$compiler$emit_with_meta(expr,meta){
return cljs.compiler.emits.call(null,"cljs.core.with_meta(",expr,",",meta,")");
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"with-meta","with-meta",-1566856820),(function (p__7783){
var map__7784 = p__7783;
var map__7784__$1 = cljs.core.__destructure_map.call(null,map__7784);
var expr = cljs.core.get.call(null,map__7784__$1,new cljs.core.Keyword(null,"expr","expr",745722291));
var meta = cljs.core.get.call(null,map__7784__$1,new cljs.core.Keyword(null,"meta","meta",1499536964));
var env = cljs.core.get.call(null,map__7784__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emit_with_meta.call(null,expr,meta);

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.distinct_keys_QMARK_ = (function cljs$compiler$distinct_keys_QMARK_(keys){
var keys__$1 = cljs.core.map.call(null,cljs.analyzer.unwrap_quote,keys);
return ((cljs.core.every_QMARK_.call(null,(function (p1__7785_SHARP_){
return cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(p1__7785_SHARP_),new cljs.core.Keyword(null,"const","const",1709929842));
}),keys__$1)) && (cljs.core._EQ_.call(null,cljs.core.count.call(null,cljs.core.into.call(null,cljs.core.PersistentHashSet.EMPTY,keys__$1)),cljs.core.count.call(null,keys__$1))));
});
cljs.compiler.obj_map_key = (function cljs$compiler$obj_map_key(x){
if((x instanceof cljs.core.Keyword)){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\"")+"\\uFDD0"+cljs.core.str.cljs$core$IFn$_invoke$arity$1("'")+cljs.core.str.cljs$core$IFn$_invoke$arity$1((cljs.core.truth_(cljs.core.namespace.call(null,x))?(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.namespace.call(null,x))+"/"):""))+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.name.call(null,x))+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\""));
} else {
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\"")+cljs.core.str.cljs$core$IFn$_invoke$arity$1(x)+cljs.core.str.cljs$core$IFn$_invoke$arity$1("\""));
}
});
cljs.compiler.emit_obj_map = (function cljs$compiler$emit_obj_map(str_keys,vals,comma_sep,distinct_keys_QMARK_){
if((cljs.core.count.call(null,str_keys) === (0))){
return cljs.compiler.emits.call(null,"cljs.core.ObjMap.EMPTY");
} else {
return cljs.compiler.emits.call(null,"cljs.core.ObjMap.fromObject([",comma_sep.call(null,str_keys),"], {",comma_sep.call(null,cljs.core.map.call(null,(function (k,v){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(k)+":"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.emit_str.call(null,v)));
}),str_keys,vals)),"})");
}
});
cljs.compiler.emit_lite_map = (function cljs$compiler$emit_lite_map(keys,vals,comma_sep,distinct_keys_QMARK_){
if((cljs.core.count.call(null,keys) === (0))){
return cljs.compiler.emits.call(null,"cljs.core.HashMapLite.EMPTY");
} else {
return cljs.compiler.emits.call(null,"cljs.core.HashMapLite.fromArrays([",comma_sep.call(null,keys),"], [",comma_sep.call(null,vals),"])");
}
});
cljs.compiler.emit_map = (function cljs$compiler$emit_map(keys,vals,comma_sep,distinct_keys_QMARK_){
if((cljs.core.count.call(null,keys) === (0))){
return cljs.compiler.emits.call(null,"cljs.core.PersistentArrayMap.EMPTY");
} else {
if((cljs.core.count.call(null,keys) <= cljs.compiler.array_map_threshold)){
if(cljs.core.truth_(distinct_keys_QMARK_.call(null,keys))){
return cljs.compiler.emits.call(null,"new cljs.core.PersistentArrayMap(null, ",cljs.core.count.call(null,keys),", [",comma_sep.call(null,cljs.core.interleave.call(null,keys,vals)),"], null)");
} else {
return cljs.compiler.emits.call(null,"cljs.core.PersistentArrayMap.createAsIfByAssoc([",comma_sep.call(null,cljs.core.interleave.call(null,keys,vals)),"])");
}
} else {
return cljs.compiler.emits.call(null,"cljs.core.PersistentHashMap.fromArrays([",comma_sep.call(null,keys),"],[",comma_sep.call(null,vals),"])");

}
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"map","map",1371690461),(function (p__7787){
var map__7788 = p__7787;
var map__7788__$1 = cljs.core.__destructure_map.call(null,map__7788);
var env = cljs.core.get.call(null,map__7788__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var form = cljs.core.get.call(null,map__7788__$1,new cljs.core.Keyword(null,"form","form",-1624062471));
var keys = cljs.core.get.call(null,map__7788__$1,new cljs.core.Keyword(null,"keys","keys",1068423698));
var vals = cljs.core.get.call(null,map__7788__$1,new cljs.core.Keyword(null,"vals","vals",768058733));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(cljs.core.truth_(cljs.analyzer.lite_mode_QMARK_.call(null))){
var form_keys_7789 = cljs.core.keys.call(null,form);
if(cljs.core.every_QMARK_.call(null,(function (p1__7786_SHARP_){
return ((typeof p1__7786_SHARP_ === 'string') || ((p1__7786_SHARP_ instanceof cljs.core.Keyword)));
}),form_keys_7789)){
cljs.compiler.emit_obj_map.call(null,cljs.core.map.call(null,cljs.compiler.obj_map_key,form_keys_7789),vals,cljs.compiler.comma_sep,cljs.compiler.distinct_keys_QMARK_);
} else {
cljs.compiler.emit_lite_map.call(null,keys,vals,cljs.compiler.comma_sep,cljs.compiler.distinct_keys_QMARK_);
}
} else {
cljs.compiler.emit_map.call(null,keys,vals,cljs.compiler.comma_sep,cljs.compiler.distinct_keys_QMARK_);
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.emit_list = (function cljs$compiler$emit_list(items,comma_sep){
if(cljs.core.empty_QMARK_.call(null,items)){
return cljs.compiler.emits.call(null,"cljs.core.List.EMPTY");
} else {
return cljs.compiler.emits.call(null,"cljs.core.list(",comma_sep.call(null,items),")");
}
});
cljs.compiler.emit_vector = (function cljs$compiler$emit_vector(items,comma_sep){
if(cljs.core.empty_QMARK_.call(null,items)){
return cljs.compiler.emits.call(null,"cljs.core.PersistentVector.EMPTY");
} else {
var cnt = cljs.core.count.call(null,items);
if((cnt < (32))){
return cljs.compiler.emits.call(null,"new cljs.core.PersistentVector(null, ",cnt,", 5, cljs.core.PersistentVector.EMPTY_NODE, [",comma_sep.call(null,items),"], null)");
} else {
return cljs.compiler.emits.call(null,"cljs.core.PersistentVector.fromArray([",comma_sep.call(null,items),"], true)");
}
}
});
cljs.compiler.emit_lite_vector = (function cljs$compiler$emit_lite_vector(items,comma_sep){
if(cljs.core.empty_QMARK_.call(null,items)){
return cljs.compiler.emits.call(null,"cljs.core.VectorLite.EMPTY");
} else {
return cljs.compiler.emits.call(null,"new cljs.core.VectorLite(null, [",comma_sep.call(null,items),"], null)");
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"vector","vector",1902966158),(function (p__7790){
var map__7791 = p__7790;
var map__7791__$1 = cljs.core.__destructure_map.call(null,map__7791);
var items = cljs.core.get.call(null,map__7791__$1,new cljs.core.Keyword(null,"items","items",1031954938));
var env = cljs.core.get.call(null,map__7791__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(cljs.core.truth_(cljs.analyzer.lite_mode_QMARK_.call(null))){
cljs.compiler.emit_lite_vector.call(null,items,cljs.compiler.comma_sep);
} else {
cljs.compiler.emit_vector.call(null,items,cljs.compiler.comma_sep);
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.distinct_constants_QMARK_ = (function cljs$compiler$distinct_constants_QMARK_(items){
var items__$1 = cljs.core.map.call(null,cljs.analyzer.unwrap_quote,items);
return ((cljs.core.every_QMARK_.call(null,(function (p1__7792_SHARP_){
return cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(p1__7792_SHARP_),new cljs.core.Keyword(null,"const","const",1709929842));
}),items__$1)) && (cljs.core._EQ_.call(null,cljs.core.count.call(null,cljs.core.into.call(null,cljs.core.PersistentHashSet.EMPTY,items__$1)),cljs.core.count.call(null,items__$1))));
});
cljs.compiler.emit_set = (function cljs$compiler$emit_set(items,comma_sep,distinct_constants_QMARK_){
if(cljs.core.empty_QMARK_.call(null,items)){
return cljs.compiler.emits.call(null,"cljs.core.PersistentHashSet.EMPTY");
} else {
if(cljs.core.truth_(distinct_constants_QMARK_.call(null,items))){
return cljs.compiler.emits.call(null,"new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, ",cljs.core.count.call(null,items),", [",comma_sep.call(null,cljs.core.interleave.call(null,items,cljs.core.repeat.call(null,"null"))),"], null), null)");
} else {
return cljs.compiler.emits.call(null,"cljs.core.PersistentHashSet.createAsIfByAssoc([",comma_sep.call(null,items),"])");

}
}
});
cljs.compiler.emit_lite_set = (function cljs$compiler$emit_lite_set(items,comma_sep,distinct_constants_QMARK_){
if(cljs.core.empty_QMARK_.call(null,items)){
return cljs.compiler.emits.call(null,"cljs.core.SetLite.EMPTY");
} else {
return cljs.compiler.emits.call(null,"cljs.core.set_lite([",comma_sep.call(null,items),"])");
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"set","set",304602554),(function (p__7793){
var map__7794 = p__7793;
var map__7794__$1 = cljs.core.__destructure_map.call(null,map__7794);
var items = cljs.core.get.call(null,map__7794__$1,new cljs.core.Keyword(null,"items","items",1031954938));
var env = cljs.core.get.call(null,map__7794__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(cljs.core.truth_(cljs.analyzer.lite_mode_QMARK_.call(null))){
cljs.compiler.emit_lite_set.call(null,items,cljs.compiler.comma_sep,cljs.compiler.distinct_constants_QMARK_);
} else {
cljs.compiler.emit_set.call(null,items,cljs.compiler.comma_sep,cljs.compiler.distinct_constants_QMARK_);
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.emit_js_object = (function cljs$compiler$emit_js_object(items,emit_js_object_val){
cljs.compiler.emits.call(null,"({");

var temp__5720__auto___7817 = cljs.core.seq.call(null,items);
if(temp__5720__auto___7817){
var items_7818__$1 = temp__5720__auto___7817;
var vec__7795_7819 = items_7818__$1;
var seq__7796_7820 = cljs.core.seq.call(null,vec__7795_7819);
var first__7797_7821 = cljs.core.first.call(null,seq__7796_7820);
var seq__7796_7822__$1 = cljs.core.next.call(null,seq__7796_7820);
var vec__7798_7823 = first__7797_7821;
var k_7824 = cljs.core.nth.call(null,vec__7798_7823,(0),null);
var v_7825 = cljs.core.nth.call(null,vec__7798_7823,(1),null);
var r_7826 = seq__7796_7822__$1;
cljs.compiler.emits.call(null,"\"",cljs.core.name.call(null,k_7824),"\": ",emit_js_object_val.call(null,v_7825));

var seq__7801_7827 = cljs.core.seq.call(null,r_7826);
var chunk__7802_7828 = null;
var count__7803_7829 = (0);
var i__7804_7830 = (0);
while(true){
if((i__7804_7830 < count__7803_7829)){
var vec__7811_7831 = cljs.core._nth.call(null,chunk__7802_7828,i__7804_7830);
var k_7832__$1 = cljs.core.nth.call(null,vec__7811_7831,(0),null);
var v_7833__$1 = cljs.core.nth.call(null,vec__7811_7831,(1),null);
cljs.compiler.emits.call(null,", \"",cljs.core.name.call(null,k_7832__$1),"\": ",emit_js_object_val.call(null,v_7833__$1));


var G__7834 = seq__7801_7827;
var G__7835 = chunk__7802_7828;
var G__7836 = count__7803_7829;
var G__7837 = (i__7804_7830 + (1));
seq__7801_7827 = G__7834;
chunk__7802_7828 = G__7835;
count__7803_7829 = G__7836;
i__7804_7830 = G__7837;
continue;
} else {
var temp__5720__auto___7838__$1 = cljs.core.seq.call(null,seq__7801_7827);
if(temp__5720__auto___7838__$1){
var seq__7801_7839__$1 = temp__5720__auto___7838__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7801_7839__$1)){
var c__2045__auto___7840 = cljs.core.chunk_first.call(null,seq__7801_7839__$1);
var G__7841 = cljs.core.chunk_rest.call(null,seq__7801_7839__$1);
var G__7842 = c__2045__auto___7840;
var G__7843 = cljs.core.count.call(null,c__2045__auto___7840);
var G__7844 = (0);
seq__7801_7827 = G__7841;
chunk__7802_7828 = G__7842;
count__7803_7829 = G__7843;
i__7804_7830 = G__7844;
continue;
} else {
var vec__7814_7845 = cljs.core.first.call(null,seq__7801_7839__$1);
var k_7846__$1 = cljs.core.nth.call(null,vec__7814_7845,(0),null);
var v_7847__$1 = cljs.core.nth.call(null,vec__7814_7845,(1),null);
cljs.compiler.emits.call(null,", \"",cljs.core.name.call(null,k_7846__$1),"\": ",emit_js_object_val.call(null,v_7847__$1));


var G__7848 = cljs.core.next.call(null,seq__7801_7839__$1);
var G__7849 = null;
var G__7850 = (0);
var G__7851 = (0);
seq__7801_7827 = G__7848;
chunk__7802_7828 = G__7849;
count__7803_7829 = G__7850;
i__7804_7830 = G__7851;
continue;
}
} else {
}
}
break;
}
} else {
}

return cljs.compiler.emits.call(null,"})");
});
cljs.compiler.emit_js_array = (function cljs$compiler$emit_js_array(items,comma_sep){
return cljs.compiler.emits.call(null,"[",comma_sep.call(null,items),"]");
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"js-object","js-object",1830199158),(function (p__7852){
var map__7853 = p__7852;
var map__7853__$1 = cljs.core.__destructure_map.call(null,map__7853);
var keys = cljs.core.get.call(null,map__7853__$1,new cljs.core.Keyword(null,"keys","keys",1068423698));
var vals = cljs.core.get.call(null,map__7853__$1,new cljs.core.Keyword(null,"vals","vals",768058733));
var env = cljs.core.get.call(null,map__7853__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emit_js_object.call(null,cljs.core.map.call(null,cljs.core.vector,keys,vals),cljs.core.identity);

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"js-array","js-array",-1210185421),(function (p__7854){
var map__7855 = p__7854;
var map__7855__$1 = cljs.core.__destructure_map.call(null,map__7855);
var items = cljs.core.get.call(null,map__7855__$1,new cljs.core.Keyword(null,"items","items",1031954938));
var env = cljs.core.get.call(null,map__7855__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emit_js_array.call(null,items,cljs.compiler.comma_sep);

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.emit_record_value = (function cljs$compiler$emit_record_value(ns,name,items){
return cljs.compiler.emits.call(null,ns,".map__GT_",name,"(",items,")");
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"quote","quote",-262615245),(function (p__7856){
var map__7857 = p__7856;
var map__7857__$1 = cljs.core.__destructure_map.call(null,map__7857);
var expr = cljs.core.get.call(null,map__7857__$1,new cljs.core.Keyword(null,"expr","expr",745722291));
return cljs.compiler.emit.call(null,expr);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"const","const",1709929842),(function (p__7858){
var map__7859 = p__7858;
var map__7859__$1 = cljs.core.__destructure_map.call(null,map__7859);
var form = cljs.core.get.call(null,map__7859__$1,new cljs.core.Keyword(null,"form","form",-1624062471));
var env = cljs.core.get.call(null,map__7859__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"statement","statement",-32780863),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
return null;
} else {
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emit_constant.call(null,form);

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}
}));
cljs.compiler.truthy_constant_QMARK_ = (function cljs$compiler$truthy_constant_QMARK_(expr){
var map__7860 = cljs.analyzer.unwrap_quote.call(null,expr);
var map__7860__$1 = cljs.core.__destructure_map.call(null,map__7860);
var op = cljs.core.get.call(null,map__7860__$1,new cljs.core.Keyword(null,"op","op",-1882987955));
var form = cljs.core.get.call(null,map__7860__$1,new cljs.core.Keyword(null,"form","form",-1624062471));
var const_expr = cljs.core.get.call(null,map__7860__$1,new cljs.core.Keyword(null,"const-expr","const-expr",-1379382292));
var or__1513__auto__ = (function (){var and__1511__auto__ = cljs.core._EQ_.call(null,op,new cljs.core.Keyword(null,"const","const",1709929842));
if(and__1511__auto__){
var and__1511__auto____$1 = form;
if(cljs.core.truth_(and__1511__auto____$1)){
return (!(((((typeof form === 'string') && (cljs.core._EQ_.call(null,form,"")))) || (((typeof form === 'number') && ((form === (0))))))));
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
})();
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
var and__1511__auto__ = (!((const_expr == null)));
if(and__1511__auto__){
return cljs.compiler.truthy_constant_QMARK_.call(null,const_expr);
} else {
return and__1511__auto__;
}
}
});
cljs.compiler.falsey_constant_QMARK_ = (function cljs$compiler$falsey_constant_QMARK_(expr){
var map__7861 = cljs.analyzer.unwrap_quote.call(null,expr);
var map__7861__$1 = cljs.core.__destructure_map.call(null,map__7861);
var op = cljs.core.get.call(null,map__7861__$1,new cljs.core.Keyword(null,"op","op",-1882987955));
var form = cljs.core.get.call(null,map__7861__$1,new cljs.core.Keyword(null,"form","form",-1624062471));
var const_expr = cljs.core.get.call(null,map__7861__$1,new cljs.core.Keyword(null,"const-expr","const-expr",-1379382292));
var or__1513__auto__ = ((cljs.core._EQ_.call(null,op,new cljs.core.Keyword(null,"const","const",1709929842))) && (((form === false) || ((form == null)))));
if(or__1513__auto__){
return or__1513__auto__;
} else {
var and__1511__auto__ = (!((const_expr == null)));
if(and__1511__auto__){
return cljs.compiler.falsey_constant_QMARK_.call(null,const_expr);
} else {
return and__1511__auto__;
}
}
});
cljs.compiler.safe_test_QMARK_ = (function cljs$compiler$safe_test_QMARK_(env,e){
var tag = cljs.analyzer.infer_tag.call(null,env,e);
var or__1513__auto__ = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Symbol(null,"seq","seq",-177272256,null),"null",new cljs.core.Symbol(null,"boolean","boolean",-278886877,null),"null"], null), null).call(null,cljs.analyzer.js_prim_ctor__GT_tag.call(null,tag,tag));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.compiler.truthy_constant_QMARK_.call(null,e);
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"if","if",-458814265),(function (p__7862){
var map__7863 = p__7862;
var map__7863__$1 = cljs.core.__destructure_map.call(null,map__7863);
var test = cljs.core.get.call(null,map__7863__$1,new cljs.core.Keyword(null,"test","test",577538877));
var then = cljs.core.get.call(null,map__7863__$1,new cljs.core.Keyword(null,"then","then",460598070));
var else$ = cljs.core.get.call(null,map__7863__$1,new cljs.core.Keyword(null,"else","else",-1508377146));
var env = cljs.core.get.call(null,map__7863__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var unchecked = cljs.core.get.call(null,map__7863__$1,new cljs.core.Keyword(null,"unchecked","unchecked",924418378));
var context = new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env);
var checked = cljs.core.not.call(null,(function (){var or__1513__auto__ = unchecked;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.compiler.safe_test_QMARK_.call(null,env,test);
}
})());
if(cljs.core.truth_(cljs.compiler.truthy_constant_QMARK_.call(null,test))){
return cljs.compiler.emitln.call(null,then);
} else {
if(cljs.core.truth_(cljs.compiler.falsey_constant_QMARK_.call(null,test))){
return cljs.compiler.emitln.call(null,else$);
} else {
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
return cljs.compiler.emits.call(null,"(",((checked)?"cljs.core.truth_":null),"(",test,")?",then,":",else$,")");
} else {
if(checked){
cljs.compiler.emitln.call(null,"if(cljs.core.truth_(",test,")){");
} else {
cljs.compiler.emitln.call(null,"if(",test,"){");
}

cljs.compiler.emitln.call(null,then,"} else {");

return cljs.compiler.emitln.call(null,else$,"}");
}

}
}
}));
cljs.compiler.iife_open = (function cljs$compiler$iife_open(p__7864){
var map__7865 = p__7864;
var map__7865__$1 = cljs.core.__destructure_map.call(null,map__7865);
var async = cljs.core.get.call(null,map__7865__$1,new cljs.core.Keyword(null,"async","async",1050769601));
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1((cljs.core.truth_(async)?"(await ":null))+"("+cljs.core.str.cljs$core$IFn$_invoke$arity$1((cljs.core.truth_(async)?"async ":null))+"function (){");
});
cljs.compiler.iife_close = (function cljs$compiler$iife_close(p__7866){
var map__7867 = p__7866;
var map__7867__$1 = cljs.core.__destructure_map.call(null,map__7867);
var async = cljs.core.get.call(null,map__7867__$1,new cljs.core.Keyword(null,"async","async",1050769601));
return (""+"})()"+cljs.core.str.cljs$core$IFn$_invoke$arity$1((cljs.core.truth_(async)?")":null)));
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"case","case",1143702196),(function (p__7868){
var map__7869 = p__7868;
var map__7869__$1 = cljs.core.__destructure_map.call(null,map__7869);
var v = cljs.core.get.call(null,map__7869__$1,new cljs.core.Keyword(null,"test","test",577538877));
var nodes = cljs.core.get.call(null,map__7869__$1,new cljs.core.Keyword(null,"nodes","nodes",-2099585805));
var default$ = cljs.core.get.call(null,map__7869__$1,new cljs.core.Keyword(null,"default","default",-1987822328));
var env = cljs.core.get.call(null,map__7869__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env),new cljs.core.Keyword(null,"expr","expr",745722291))){
cljs.compiler.emitln.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

var gs = cljs.core.gensym.call(null,"caseval__");
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,"var ",gs,";");
} else {
}

cljs.compiler.emitln.call(null,"switch (",v,") {");

var seq__7870_7898 = cljs.core.seq.call(null,nodes);
var chunk__7871_7899 = null;
var count__7872_7900 = (0);
var i__7873_7901 = (0);
while(true){
if((i__7873_7901 < count__7872_7900)){
var map__7886_7902 = cljs.core._nth.call(null,chunk__7871_7899,i__7873_7901);
var map__7886_7903__$1 = cljs.core.__destructure_map.call(null,map__7886_7902);
var ts_7904 = cljs.core.get.call(null,map__7886_7903__$1,new cljs.core.Keyword(null,"tests","tests",-1041085625));
var map__7887_7905 = cljs.core.get.call(null,map__7886_7903__$1,new cljs.core.Keyword(null,"then","then",460598070));
var map__7887_7906__$1 = cljs.core.__destructure_map.call(null,map__7887_7905);
var then_7907 = cljs.core.get.call(null,map__7887_7906__$1,new cljs.core.Keyword(null,"then","then",460598070));
var seq__7888_7908 = cljs.core.seq.call(null,cljs.core.map.call(null,new cljs.core.Keyword(null,"test","test",577538877),ts_7904));
var chunk__7889_7909 = null;
var count__7890_7910 = (0);
var i__7891_7911 = (0);
while(true){
if((i__7891_7911 < count__7890_7910)){
var test_7912 = cljs.core._nth.call(null,chunk__7889_7909,i__7891_7911);
cljs.compiler.emitln.call(null,"case ",test_7912,":");


var G__7913 = seq__7888_7908;
var G__7914 = chunk__7889_7909;
var G__7915 = count__7890_7910;
var G__7916 = (i__7891_7911 + (1));
seq__7888_7908 = G__7913;
chunk__7889_7909 = G__7914;
count__7890_7910 = G__7915;
i__7891_7911 = G__7916;
continue;
} else {
var temp__5720__auto___7917 = cljs.core.seq.call(null,seq__7888_7908);
if(temp__5720__auto___7917){
var seq__7888_7918__$1 = temp__5720__auto___7917;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7888_7918__$1)){
var c__2045__auto___7919 = cljs.core.chunk_first.call(null,seq__7888_7918__$1);
var G__7920 = cljs.core.chunk_rest.call(null,seq__7888_7918__$1);
var G__7921 = c__2045__auto___7919;
var G__7922 = cljs.core.count.call(null,c__2045__auto___7919);
var G__7923 = (0);
seq__7888_7908 = G__7920;
chunk__7889_7909 = G__7921;
count__7890_7910 = G__7922;
i__7891_7911 = G__7923;
continue;
} else {
var test_7924 = cljs.core.first.call(null,seq__7888_7918__$1);
cljs.compiler.emitln.call(null,"case ",test_7924,":");


var G__7925 = cljs.core.next.call(null,seq__7888_7918__$1);
var G__7926 = null;
var G__7927 = (0);
var G__7928 = (0);
seq__7888_7908 = G__7925;
chunk__7889_7909 = G__7926;
count__7890_7910 = G__7927;
i__7891_7911 = G__7928;
continue;
}
} else {
}
}
break;
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,gs,"=",then_7907);
} else {
cljs.compiler.emitln.call(null,then_7907);
}

cljs.compiler.emitln.call(null,"break;");


var G__7929 = seq__7870_7898;
var G__7930 = chunk__7871_7899;
var G__7931 = count__7872_7900;
var G__7932 = (i__7873_7901 + (1));
seq__7870_7898 = G__7929;
chunk__7871_7899 = G__7930;
count__7872_7900 = G__7931;
i__7873_7901 = G__7932;
continue;
} else {
var temp__5720__auto___7933 = cljs.core.seq.call(null,seq__7870_7898);
if(temp__5720__auto___7933){
var seq__7870_7934__$1 = temp__5720__auto___7933;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7870_7934__$1)){
var c__2045__auto___7935 = cljs.core.chunk_first.call(null,seq__7870_7934__$1);
var G__7936 = cljs.core.chunk_rest.call(null,seq__7870_7934__$1);
var G__7937 = c__2045__auto___7935;
var G__7938 = cljs.core.count.call(null,c__2045__auto___7935);
var G__7939 = (0);
seq__7870_7898 = G__7936;
chunk__7871_7899 = G__7937;
count__7872_7900 = G__7938;
i__7873_7901 = G__7939;
continue;
} else {
var map__7892_7940 = cljs.core.first.call(null,seq__7870_7934__$1);
var map__7892_7941__$1 = cljs.core.__destructure_map.call(null,map__7892_7940);
var ts_7942 = cljs.core.get.call(null,map__7892_7941__$1,new cljs.core.Keyword(null,"tests","tests",-1041085625));
var map__7893_7943 = cljs.core.get.call(null,map__7892_7941__$1,new cljs.core.Keyword(null,"then","then",460598070));
var map__7893_7944__$1 = cljs.core.__destructure_map.call(null,map__7893_7943);
var then_7945 = cljs.core.get.call(null,map__7893_7944__$1,new cljs.core.Keyword(null,"then","then",460598070));
var seq__7894_7946 = cljs.core.seq.call(null,cljs.core.map.call(null,new cljs.core.Keyword(null,"test","test",577538877),ts_7942));
var chunk__7895_7947 = null;
var count__7896_7948 = (0);
var i__7897_7949 = (0);
while(true){
if((i__7897_7949 < count__7896_7948)){
var test_7950 = cljs.core._nth.call(null,chunk__7895_7947,i__7897_7949);
cljs.compiler.emitln.call(null,"case ",test_7950,":");


var G__7951 = seq__7894_7946;
var G__7952 = chunk__7895_7947;
var G__7953 = count__7896_7948;
var G__7954 = (i__7897_7949 + (1));
seq__7894_7946 = G__7951;
chunk__7895_7947 = G__7952;
count__7896_7948 = G__7953;
i__7897_7949 = G__7954;
continue;
} else {
var temp__5720__auto___7955__$1 = cljs.core.seq.call(null,seq__7894_7946);
if(temp__5720__auto___7955__$1){
var seq__7894_7956__$1 = temp__5720__auto___7955__$1;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7894_7956__$1)){
var c__2045__auto___7957 = cljs.core.chunk_first.call(null,seq__7894_7956__$1);
var G__7958 = cljs.core.chunk_rest.call(null,seq__7894_7956__$1);
var G__7959 = c__2045__auto___7957;
var G__7960 = cljs.core.count.call(null,c__2045__auto___7957);
var G__7961 = (0);
seq__7894_7946 = G__7958;
chunk__7895_7947 = G__7959;
count__7896_7948 = G__7960;
i__7897_7949 = G__7961;
continue;
} else {
var test_7962 = cljs.core.first.call(null,seq__7894_7956__$1);
cljs.compiler.emitln.call(null,"case ",test_7962,":");


var G__7963 = cljs.core.next.call(null,seq__7894_7956__$1);
var G__7964 = null;
var G__7965 = (0);
var G__7966 = (0);
seq__7894_7946 = G__7963;
chunk__7895_7947 = G__7964;
count__7896_7948 = G__7965;
i__7897_7949 = G__7966;
continue;
}
} else {
}
}
break;
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,gs,"=",then_7945);
} else {
cljs.compiler.emitln.call(null,then_7945);
}

cljs.compiler.emitln.call(null,"break;");


var G__7967 = cljs.core.next.call(null,seq__7870_7934__$1);
var G__7968 = null;
var G__7969 = (0);
var G__7970 = (0);
seq__7870_7898 = G__7967;
chunk__7871_7899 = G__7968;
count__7872_7900 = G__7969;
i__7873_7901 = G__7970;
continue;
}
} else {
}
}
break;
}

if(cljs.core.truth_(default$)){
cljs.compiler.emitln.call(null,"default:");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,gs,"=",default$);
} else {
cljs.compiler.emitln.call(null,default$);
}
} else {
}

cljs.compiler.emitln.call(null,"}");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
return cljs.compiler.emitln.call(null,"return ",gs,";",cljs.compiler.iife_close.call(null,env));
} else {
return null;
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"throw","throw",-1044625833),(function (p__7971){
var map__7972 = p__7971;
var map__7972__$1 = cljs.core.__destructure_map.call(null,map__7972);
var throw$ = cljs.core.get.call(null,map__7972__$1,new cljs.core.Keyword(null,"exception","exception",-335277064));
var env = cljs.core.get.call(null,map__7972__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
return cljs.compiler.emits.call(null,cljs.compiler.iife_open.call(null,env),"throw ",throw$,cljs.compiler.iife_close.call(null,env));
} else {
return cljs.compiler.emitln.call(null,"throw ",throw$,";");
}
}));
cljs.compiler.base_types = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 15, ["boolean",null,"object",null,"*",null,"string",null,"Object",null,"Number",null,"null",null,"Date",null,"number",null,"String",null,"RegExp",null,"...*",null,"Array",null,"array",null,"Boolean",null], null), null);
cljs.compiler.mapped_types = new cljs.core.PersistentArrayMap(null, 1, ["nil","null"], null);
cljs.compiler.resolve_type = (function cljs$compiler$resolve_type(env,t){
if(cljs.core.truth_(cljs.core.get.call(null,cljs.compiler.base_types,t))){
return t;
} else {
if(cljs.core.truth_(cljs.core.get.call(null,cljs.compiler.mapped_types,t))){
return cljs.core.get.call(null,cljs.compiler.mapped_types,t);
} else {
if(goog.string.startsWith(t,"!")){
return (""+"!"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.resolve_type.call(null,env,cljs.core.subs.call(null,t,(1)))));
} else {
if(goog.string.startsWith(t,"{")){
return t;
} else {
if(goog.string.startsWith(t,"function")){
var idx = t.lastIndexOf(":");
var vec__7974 = (((!(((-1) === idx))))?new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.subs.call(null,t,(0),idx),cljs.core.subs.call(null,t,(idx + (1)),cljs.core.count.call(null,t))], null):new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [t,null], null));
var fstr = cljs.core.nth.call(null,vec__7974,(0),null);
var rstr = cljs.core.nth.call(null,vec__7974,(1),null);
var ret_t = (cljs.core.truth_(rstr)?cljs.compiler.resolve_type.call(null,env,rstr):null);
var axstr = cljs.core.subs.call(null,fstr,(9),(cljs.core.count.call(null,fstr) - (1)));
var args_ts = ((clojure.string.blank_QMARK_.call(null,axstr))?null:cljs.core.map.call(null,cljs.core.comp.call(null,(function (p1__7973_SHARP_){
return cljs.compiler.resolve_type.call(null,env,p1__7973_SHARP_);
}),clojure.string.trim),clojure.string.split.call(null,axstr,/,/)));
var G__7977 = (""+"function("+cljs.core.str.cljs$core$IFn$_invoke$arity$1(clojure.string.join.call(null,",",args_ts))+")");
if(cljs.core.truth_(ret_t)){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(G__7977)+":"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ret_t));
} else {
return G__7977;
}
} else {
if(goog.string.endsWith(t,"=")){
return (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.resolve_type.call(null,env,cljs.core.subs.call(null,t,(0),(cljs.core.count.call(null,t) - (1)))))+"=");
} else {
return cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(cljs.analyzer.resolve_var.call(null,env,cljs.core.symbol.call(null,t))))));

}
}
}
}
}
}
});
cljs.compiler.resolve_types = (function cljs$compiler$resolve_types(env,ts){
var ts__$1 = cljs.core.subs.call(null,clojure.string.trim.call(null,ts),(1),(cljs.core.count.call(null,ts) - (1)));
var xs = clojure.string.split.call(null,ts__$1,/\|/);
return (""+"{"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(clojure.string.join.call(null,"|",cljs.core.map.call(null,(function (p1__7978_SHARP_){
return cljs.compiler.resolve_type.call(null,env,p1__7978_SHARP_);
}),xs)))+"}");
});
cljs.compiler.munge_param_return = (function cljs$compiler$munge_param_return(env,line){
if(cljs.core.truth_(cljs.core.re_find.call(null,/@param/,line))){
var vec__7979 = cljs.core.map.call(null,clojure.string.trim,clojure.string.split.call(null,clojure.string.trim.call(null,line),/ /));
var seq__7980 = cljs.core.seq.call(null,vec__7979);
var first__7981 = cljs.core.first.call(null,seq__7980);
var seq__7980__$1 = cljs.core.next.call(null,seq__7980);
var p = first__7981;
var first__7981__$1 = cljs.core.first.call(null,seq__7980__$1);
var seq__7980__$2 = cljs.core.next.call(null,seq__7980__$1);
var ts = first__7981__$1;
var first__7981__$2 = cljs.core.first.call(null,seq__7980__$2);
var seq__7980__$3 = cljs.core.next.call(null,seq__7980__$2);
var n = first__7981__$2;
var xs = seq__7980__$3;
if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.core._EQ_.call(null,"@param",p);
if(and__1511__auto__){
var and__1511__auto____$1 = ts;
if(cljs.core.truth_(and__1511__auto____$1)){
return goog.string.startsWith(ts,"{");
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
})())){
return clojure.string.join.call(null," ",cljs.core.concat.call(null,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [p,cljs.compiler.resolve_types.call(null,env,ts),cljs.compiler.munge.call(null,n)], null),xs));
} else {
return line;
}
} else {
if(cljs.core.truth_(cljs.core.re_find.call(null,/@return/,line))){
var vec__7982 = cljs.core.map.call(null,clojure.string.trim,clojure.string.split.call(null,clojure.string.trim.call(null,line),/ /));
var seq__7983 = cljs.core.seq.call(null,vec__7982);
var first__7984 = cljs.core.first.call(null,seq__7983);
var seq__7983__$1 = cljs.core.next.call(null,seq__7983);
var p = first__7984;
var first__7984__$1 = cljs.core.first.call(null,seq__7983__$1);
var seq__7983__$2 = cljs.core.next.call(null,seq__7983__$1);
var ts = first__7984__$1;
var xs = seq__7983__$2;
if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.core._EQ_.call(null,"@return",p);
if(and__1511__auto__){
var and__1511__auto____$1 = ts;
if(cljs.core.truth_(and__1511__auto____$1)){
return goog.string.startsWith(ts,"{");
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
})())){
return clojure.string.join.call(null," ",cljs.core.concat.call(null,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [p,cljs.compiler.resolve_types.call(null,env,ts)], null),xs));
} else {
return line;
}
} else {
return line;

}
}
});
cljs.compiler.checking_types_QMARK_ = (function cljs$compiler$checking_types_QMARK_(){
return new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"warning","warning",-1685650671),null,new cljs.core.Keyword(null,"error","error",-978969032),null], null), null).call(null,cljs.core.get_in.call(null,cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"options","options",99638489),new cljs.core.Keyword(null,"closure-warnings","closure-warnings",1362834211),new cljs.core.Keyword(null,"check-types","check-types",-833794607)], null)));
});
/**
 * Emit a nicely formatted comment string.
 */
cljs.compiler.emit_comment = (function cljs$compiler$emit_comment(var_args){
var G__7987 = arguments.length;
switch (G__7987) {
case 2:
return cljs.compiler.emit_comment.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return cljs.compiler.emit_comment.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.compiler.emit_comment.cljs$core$IFn$_invoke$arity$2 = (function (doc,jsdoc){
return cljs.compiler.emit_comment.call(null,null,doc,jsdoc);
}));

(cljs.compiler.emit_comment.cljs$core$IFn$_invoke$arity$3 = (function (env,doc,jsdoc){
var docs = (cljs.core.truth_(doc)?new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [doc], null):null);
var docs__$1 = (cljs.core.truth_(jsdoc)?cljs.core.concat.call(null,docs,jsdoc):docs);
var docs__$2 = cljs.core.remove.call(null,cljs.core.nil_QMARK_,docs__$1);
var print_comment_lines = (function cljs$compiler$print_comment_lines(e){
var vec__7995 = cljs.core.map.call(null,(function (p1__7985_SHARP_){
if(cljs.core.truth_(cljs.compiler.checking_types_QMARK_.call(null))){
return cljs.compiler.munge_param_return.call(null,env,p1__7985_SHARP_);
} else {
return p1__7985_SHARP_;
}
}),clojure.string.split_lines.call(null,e));
var seq__7996 = cljs.core.seq.call(null,vec__7995);
var first__7997 = cljs.core.first.call(null,seq__7996);
var seq__7996__$1 = cljs.core.next.call(null,seq__7996);
var x = first__7997;
var ys = seq__7996__$1;
cljs.compiler.emitln.call(null," * ",clojure.string.replace.call(null,x,"*/","* /"));

var seq__7998 = cljs.core.seq.call(null,ys);
var chunk__7999 = null;
var count__8000 = (0);
var i__8001 = (0);
while(true){
if((i__8001 < count__8000)){
var next_line = cljs.core._nth.call(null,chunk__7999,i__8001);
cljs.compiler.emitln.call(null," * ",clojure.string.replace.call(null,clojure.string.replace.call(null,next_line,/^   /,""),"*/","* /"));


var G__8007 = seq__7998;
var G__8008 = chunk__7999;
var G__8009 = count__8000;
var G__8010 = (i__8001 + (1));
seq__7998 = G__8007;
chunk__7999 = G__8008;
count__8000 = G__8009;
i__8001 = G__8010;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__7998);
if(temp__5720__auto__){
var seq__7998__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__7998__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__7998__$1);
var G__8011 = cljs.core.chunk_rest.call(null,seq__7998__$1);
var G__8012 = c__2045__auto__;
var G__8013 = cljs.core.count.call(null,c__2045__auto__);
var G__8014 = (0);
seq__7998 = G__8011;
chunk__7999 = G__8012;
count__8000 = G__8013;
i__8001 = G__8014;
continue;
} else {
var next_line = cljs.core.first.call(null,seq__7998__$1);
cljs.compiler.emitln.call(null," * ",clojure.string.replace.call(null,clojure.string.replace.call(null,next_line,/^   /,""),"*/","* /"));


var G__8015 = cljs.core.next.call(null,seq__7998__$1);
var G__8016 = null;
var G__8017 = (0);
var G__8018 = (0);
seq__7998 = G__8015;
chunk__7999 = G__8016;
count__8000 = G__8017;
i__8001 = G__8018;
continue;
}
} else {
return null;
}
}
break;
}
});
if(cljs.core.seq.call(null,docs__$2)){
cljs.compiler.emitln.call(null,"/**");

var seq__8002_8019 = cljs.core.seq.call(null,docs__$2);
var chunk__8003_8020 = null;
var count__8004_8021 = (0);
var i__8005_8022 = (0);
while(true){
if((i__8005_8022 < count__8004_8021)){
var e_8023 = cljs.core._nth.call(null,chunk__8003_8020,i__8005_8022);
if(cljs.core.truth_(e_8023)){
print_comment_lines.call(null,e_8023);
} else {
}


var G__8024 = seq__8002_8019;
var G__8025 = chunk__8003_8020;
var G__8026 = count__8004_8021;
var G__8027 = (i__8005_8022 + (1));
seq__8002_8019 = G__8024;
chunk__8003_8020 = G__8025;
count__8004_8021 = G__8026;
i__8005_8022 = G__8027;
continue;
} else {
var temp__5720__auto___8028 = cljs.core.seq.call(null,seq__8002_8019);
if(temp__5720__auto___8028){
var seq__8002_8029__$1 = temp__5720__auto___8028;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8002_8029__$1)){
var c__2045__auto___8030 = cljs.core.chunk_first.call(null,seq__8002_8029__$1);
var G__8031 = cljs.core.chunk_rest.call(null,seq__8002_8029__$1);
var G__8032 = c__2045__auto___8030;
var G__8033 = cljs.core.count.call(null,c__2045__auto___8030);
var G__8034 = (0);
seq__8002_8019 = G__8031;
chunk__8003_8020 = G__8032;
count__8004_8021 = G__8033;
i__8005_8022 = G__8034;
continue;
} else {
var e_8035 = cljs.core.first.call(null,seq__8002_8029__$1);
if(cljs.core.truth_(e_8035)){
print_comment_lines.call(null,e_8035);
} else {
}


var G__8036 = cljs.core.next.call(null,seq__8002_8029__$1);
var G__8037 = null;
var G__8038 = (0);
var G__8039 = (0);
seq__8002_8019 = G__8036;
chunk__8003_8020 = G__8037;
count__8004_8021 = G__8038;
i__8005_8022 = G__8039;
continue;
}
} else {
}
}
break;
}

return cljs.compiler.emitln.call(null," */");
} else {
return null;
}
}));

(cljs.compiler.emit_comment.cljs$lang$maxFixedArity = 3);

cljs.compiler.valid_define_value_QMARK_ = (function cljs$compiler$valid_define_value_QMARK_(x){
return ((typeof x === 'string') || (((x === true) || (((x === false) || (typeof x === 'number'))))));
});
cljs.compiler.get_define = (function cljs$compiler$get_define(mname,jsdoc){
var opts = cljs.core.get.call(null,cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_),new cljs.core.Keyword(null,"options","options",99638489));
var and__1511__auto__ = cljs.core.some.call(null,(function (p1__8041_SHARP_){
return goog.string.startsWith(p1__8041_SHARP_,"@define");
}),jsdoc);
if(cljs.core.truth_(and__1511__auto__)){
var and__1511__auto____$1 = opts;
if(cljs.core.truth_(and__1511__auto____$1)){
var and__1511__auto____$2 = cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"optimizations","optimizations",-2047476854).cljs$core$IFn$_invoke$arity$1(opts),new cljs.core.Keyword(null,"none","none",1333468478));
if(and__1511__auto____$2){
var define = cljs.core.get_in.call(null,opts,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"closure-defines","closure-defines",-1213856476),(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(mname))], null));
if(cljs.compiler.valid_define_value_QMARK_.call(null,define)){
return cljs.core.pr_str.call(null,define);
} else {
return null;
}
} else {
return and__1511__auto____$2;
}
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"def","def",-1043430536),(function (p__8042){
var map__8043 = p__8042;
var map__8043__$1 = cljs.core.__destructure_map.call(null,map__8043);
var doc = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"doc","doc",1913296891));
var jsdoc = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"jsdoc","jsdoc",1745183516));
var test = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"test","test",577538877));
var goog_define = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"goog-define","goog-define",-1048305441));
var init = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"init","init",-1875481434));
var name = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var env = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var export$ = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"export","export",214356590));
var var$ = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"var","var",-769682797));
var var_ast = cljs.core.get.call(null,map__8043__$1,new cljs.core.Keyword(null,"var-ast","var-ast",1200379319));
if(cljs.core.truth_((function (){var or__1513__auto__ = init;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return new cljs.core.Keyword(null,"def-emits-var","def-emits-var",-1551927320).cljs$core$IFn$_invoke$arity$1(env);
}
})())){
var mname = cljs.compiler.munge.call(null,name);
cljs.compiler.emit_comment.call(null,env,doc,cljs.core.concat.call(null,(cljs.core.truth_(goog_define)?new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(""+"@define {"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(goog_define)+"}")], null):null),jsdoc,new cljs.core.Keyword(null,"jsdoc","jsdoc",1745183516).cljs$core$IFn$_invoke$arity$1(init)));

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,"return (");
} else {
}

if(cljs.core.truth_(new cljs.core.Keyword(null,"def-emits-var","def-emits-var",-1551927320).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

cljs.compiler.emits.call(null,var$);

if(cljs.core.truth_(init)){
cljs.compiler.emits.call(null," = ",(function (){var temp__5718__auto__ = cljs.compiler.get_define.call(null,mname,jsdoc);
if(cljs.core.truth_(temp__5718__auto__)){
var define = temp__5718__auto__;
return define;
} else {
return init;
}
})());
} else {
}

if(cljs.core.truth_(new cljs.core.Keyword(null,"def-emits-var","def-emits-var",-1551927320).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,"; return (");

cljs.compiler.emits.call(null,cljs.core.merge.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"op","op",-1882987955),new cljs.core.Keyword(null,"the-var","the-var",1428415613),new cljs.core.Keyword(null,"env","env",-1815813235),cljs.core.assoc.call(null,env,new cljs.core.Keyword(null,"context","context",-830191113),new cljs.core.Keyword(null,"expr","expr",745722291))], null),var_ast));

cljs.compiler.emitln.call(null,");",cljs.compiler.iife_close.call(null,env));
} else {
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,")");
} else {
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
} else {
cljs.compiler.emitln.call(null,";");
}

if(cljs.core.truth_(export$)){
cljs.compiler.emitln.call(null,"goog.exportSymbol('",cljs.compiler.munge.call(null,export$),"', ",mname,");");
} else {
}

if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.analyzer._STAR_load_tests_STAR_;
if(cljs.core.truth_(and__1511__auto__)){
return test;
} else {
return and__1511__auto__;
}
})())){
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emitln.call(null,";");
} else {
}

return cljs.compiler.emitln.call(null,var$,".cljs$lang$test = ",test,";");
} else {
return null;
}
} else {
return null;
}
}));
cljs.compiler.emit_apply_to = (function cljs$compiler$emit_apply_to(p__8044){
var map__8045 = p__8044;
var map__8045__$1 = cljs.core.__destructure_map.call(null,map__8045);
var name = cljs.core.get.call(null,map__8045__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var params = cljs.core.get.call(null,map__8045__$1,new cljs.core.Keyword(null,"params","params",710516235));
var env = cljs.core.get.call(null,map__8045__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var arglist = cljs.core.gensym.call(null,"arglist__");
var delegate_name = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.munge.call(null,name))+"__delegate");
cljs.compiler.emitln.call(null,"(function (",arglist,"){");

var seq__8046_8070 = cljs.core.seq.call(null,cljs.core.map_indexed.call(null,cljs.core.vector,cljs.core.drop_last.call(null,(2),params)));
var chunk__8047_8071 = null;
var count__8048_8072 = (0);
var i__8049_8073 = (0);
while(true){
if((i__8049_8073 < count__8048_8072)){
var vec__8056_8074 = cljs.core._nth.call(null,chunk__8047_8071,i__8049_8073);
var i_8075 = cljs.core.nth.call(null,vec__8056_8074,(0),null);
var param_8076 = cljs.core.nth.call(null,vec__8056_8074,(1),null);
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,param_8076);

cljs.compiler.emits.call(null," = cljs.core.first(");

cljs.compiler.emitln.call(null,arglist,");");

cljs.compiler.emitln.call(null,arglist," = cljs.core.next(",arglist,");");


var G__8077 = seq__8046_8070;
var G__8078 = chunk__8047_8071;
var G__8079 = count__8048_8072;
var G__8080 = (i__8049_8073 + (1));
seq__8046_8070 = G__8077;
chunk__8047_8071 = G__8078;
count__8048_8072 = G__8079;
i__8049_8073 = G__8080;
continue;
} else {
var temp__5720__auto___8081 = cljs.core.seq.call(null,seq__8046_8070);
if(temp__5720__auto___8081){
var seq__8046_8082__$1 = temp__5720__auto___8081;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8046_8082__$1)){
var c__2045__auto___8083 = cljs.core.chunk_first.call(null,seq__8046_8082__$1);
var G__8084 = cljs.core.chunk_rest.call(null,seq__8046_8082__$1);
var G__8085 = c__2045__auto___8083;
var G__8086 = cljs.core.count.call(null,c__2045__auto___8083);
var G__8087 = (0);
seq__8046_8070 = G__8084;
chunk__8047_8071 = G__8085;
count__8048_8072 = G__8086;
i__8049_8073 = G__8087;
continue;
} else {
var vec__8059_8088 = cljs.core.first.call(null,seq__8046_8082__$1);
var i_8089 = cljs.core.nth.call(null,vec__8059_8088,(0),null);
var param_8090 = cljs.core.nth.call(null,vec__8059_8088,(1),null);
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,param_8090);

cljs.compiler.emits.call(null," = cljs.core.first(");

cljs.compiler.emitln.call(null,arglist,");");

cljs.compiler.emitln.call(null,arglist," = cljs.core.next(",arglist,");");


var G__8091 = cljs.core.next.call(null,seq__8046_8082__$1);
var G__8092 = null;
var G__8093 = (0);
var G__8094 = (0);
seq__8046_8070 = G__8091;
chunk__8047_8071 = G__8092;
count__8048_8072 = G__8093;
i__8049_8073 = G__8094;
continue;
}
} else {
}
}
break;
}

if(((1) < cljs.core.count.call(null,params))){
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,cljs.core.last.call(null,cljs.core.butlast.call(null,params)));

cljs.compiler.emitln.call(null," = cljs.core.first(",arglist,");");

cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,cljs.core.last.call(null,params));

cljs.compiler.emitln.call(null," = cljs.core.rest(",arglist,");");

cljs.compiler.emits.call(null,"return ",delegate_name,"(");

var seq__8062_8095 = cljs.core.seq.call(null,params);
var chunk__8063_8096 = null;
var count__8064_8097 = (0);
var i__8065_8098 = (0);
while(true){
if((i__8065_8098 < count__8064_8097)){
var param_8099 = cljs.core._nth.call(null,chunk__8063_8096,i__8065_8098);
cljs.compiler.emit.call(null,param_8099);

if(cljs.core._EQ_.call(null,param_8099,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8100 = seq__8062_8095;
var G__8101 = chunk__8063_8096;
var G__8102 = count__8064_8097;
var G__8103 = (i__8065_8098 + (1));
seq__8062_8095 = G__8100;
chunk__8063_8096 = G__8101;
count__8064_8097 = G__8102;
i__8065_8098 = G__8103;
continue;
} else {
var temp__5720__auto___8104 = cljs.core.seq.call(null,seq__8062_8095);
if(temp__5720__auto___8104){
var seq__8062_8105__$1 = temp__5720__auto___8104;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8062_8105__$1)){
var c__2045__auto___8106 = cljs.core.chunk_first.call(null,seq__8062_8105__$1);
var G__8107 = cljs.core.chunk_rest.call(null,seq__8062_8105__$1);
var G__8108 = c__2045__auto___8106;
var G__8109 = cljs.core.count.call(null,c__2045__auto___8106);
var G__8110 = (0);
seq__8062_8095 = G__8107;
chunk__8063_8096 = G__8108;
count__8064_8097 = G__8109;
i__8065_8098 = G__8110;
continue;
} else {
var param_8111 = cljs.core.first.call(null,seq__8062_8105__$1);
cljs.compiler.emit.call(null,param_8111);

if(cljs.core._EQ_.call(null,param_8111,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8112 = cljs.core.next.call(null,seq__8062_8105__$1);
var G__8113 = null;
var G__8114 = (0);
var G__8115 = (0);
seq__8062_8095 = G__8112;
chunk__8063_8096 = G__8113;
count__8064_8097 = G__8114;
i__8065_8098 = G__8115;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,");");
} else {
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,cljs.core.last.call(null,params));

cljs.compiler.emitln.call(null," = cljs.core.seq(",arglist,");");

cljs.compiler.emits.call(null,"return ",delegate_name,"(");

var seq__8066_8116 = cljs.core.seq.call(null,params);
var chunk__8067_8117 = null;
var count__8068_8118 = (0);
var i__8069_8119 = (0);
while(true){
if((i__8069_8119 < count__8068_8118)){
var param_8120 = cljs.core._nth.call(null,chunk__8067_8117,i__8069_8119);
cljs.compiler.emit.call(null,param_8120);

if(cljs.core._EQ_.call(null,param_8120,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8121 = seq__8066_8116;
var G__8122 = chunk__8067_8117;
var G__8123 = count__8068_8118;
var G__8124 = (i__8069_8119 + (1));
seq__8066_8116 = G__8121;
chunk__8067_8117 = G__8122;
count__8068_8118 = G__8123;
i__8069_8119 = G__8124;
continue;
} else {
var temp__5720__auto___8125 = cljs.core.seq.call(null,seq__8066_8116);
if(temp__5720__auto___8125){
var seq__8066_8126__$1 = temp__5720__auto___8125;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8066_8126__$1)){
var c__2045__auto___8127 = cljs.core.chunk_first.call(null,seq__8066_8126__$1);
var G__8128 = cljs.core.chunk_rest.call(null,seq__8066_8126__$1);
var G__8129 = c__2045__auto___8127;
var G__8130 = cljs.core.count.call(null,c__2045__auto___8127);
var G__8131 = (0);
seq__8066_8116 = G__8128;
chunk__8067_8117 = G__8129;
count__8068_8118 = G__8130;
i__8069_8119 = G__8131;
continue;
} else {
var param_8132 = cljs.core.first.call(null,seq__8066_8126__$1);
cljs.compiler.emit.call(null,param_8132);

if(cljs.core._EQ_.call(null,param_8132,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8133 = cljs.core.next.call(null,seq__8066_8126__$1);
var G__8134 = null;
var G__8135 = (0);
var G__8136 = (0);
seq__8066_8116 = G__8133;
chunk__8067_8117 = G__8134;
count__8068_8118 = G__8135;
i__8069_8119 = G__8136;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,");");
}

return cljs.compiler.emits.call(null,"})");
});
cljs.compiler.emit_fn_params = (function cljs$compiler$emit_fn_params(params){
var seq__8137 = cljs.core.seq.call(null,params);
var chunk__8138 = null;
var count__8139 = (0);
var i__8140 = (0);
while(true){
if((i__8140 < count__8139)){
var param = cljs.core._nth.call(null,chunk__8138,i__8140);
cljs.compiler.emit.call(null,param);

if(cljs.core._EQ_.call(null,param,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8141 = seq__8137;
var G__8142 = chunk__8138;
var G__8143 = count__8139;
var G__8144 = (i__8140 + (1));
seq__8137 = G__8141;
chunk__8138 = G__8142;
count__8139 = G__8143;
i__8140 = G__8144;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__8137);
if(temp__5720__auto__){
var seq__8137__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8137__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__8137__$1);
var G__8145 = cljs.core.chunk_rest.call(null,seq__8137__$1);
var G__8146 = c__2045__auto__;
var G__8147 = cljs.core.count.call(null,c__2045__auto__);
var G__8148 = (0);
seq__8137 = G__8145;
chunk__8138 = G__8146;
count__8139 = G__8147;
i__8140 = G__8148;
continue;
} else {
var param = cljs.core.first.call(null,seq__8137__$1);
cljs.compiler.emit.call(null,param);

if(cljs.core._EQ_.call(null,param,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8149 = cljs.core.next.call(null,seq__8137__$1);
var G__8150 = null;
var G__8151 = (0);
var G__8152 = (0);
seq__8137 = G__8149;
chunk__8138 = G__8150;
count__8139 = G__8151;
i__8140 = G__8152;
continue;
}
} else {
return null;
}
}
break;
}
});
cljs.compiler.emit_fn_method = (function cljs$compiler$emit_fn_method(p__8153){
var map__8154 = p__8153;
var map__8154__$1 = cljs.core.__destructure_map.call(null,map__8154);
var expr = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var type = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"type","type",1174270348));
var name = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var params = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"params","params",710516235));
var env = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var recurs = cljs.core.get.call(null,map__8154__$1,new cljs.core.Keyword(null,"recurs","recurs",-1959309309));
var async = new cljs.core.Keyword(null,"async","async",1050769601).cljs$core$IFn$_invoke$arity$1(env);
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"(",(cljs.core.truth_(async)?"async ":null),"function ",cljs.compiler.munge.call(null,name),"(");

cljs.compiler.emit_fn_params.call(null,params);

cljs.compiler.emitln.call(null,"){");

if(cljs.core.truth_(type)){
cljs.compiler.emitln.call(null,"var self__ = this;");
} else {
}

if(cljs.core.truth_(recurs)){
cljs.compiler.emitln.call(null,"while(true){");
} else {
}

cljs.compiler.emits.call(null,expr);

if(cljs.core.truth_(recurs)){
cljs.compiler.emitln.call(null,"break;");

cljs.compiler.emitln.call(null,"}");
} else {
}

cljs.compiler.emits.call(null,"})");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
});
/**
 * Emit code that copies function arguments into an array starting at an index.
 *   Returns name of var holding the array.
 */
cljs.compiler.emit_arguments_to_array = (function cljs$compiler$emit_arguments_to_array(startslice){
if((((startslice >= (0))) && (cljs.core.integer_QMARK_.call(null,startslice)))){
} else {
throw (new Error("Assert failed: (and (>= startslice 0) (integer? startslice))"));
}

var mname = cljs.compiler.munge.call(null,cljs.core.gensym.call(null));
var i = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(mname)+"__i");
var a = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(mname)+"__a");
cljs.compiler.emitln.call(null,"var ",i," = 0, ",a," = new Array(arguments.length -  ",startslice,");");

cljs.compiler.emitln.call(null,"while (",i," < ",a,".length) {",a,"[",i,"] = arguments[",i," + ",startslice,"]; ++",i,";}");

return a;
});
cljs.compiler.emit_variadic_fn_method = (function cljs$compiler$emit_variadic_fn_method(p__8155){
var map__8156 = p__8155;
var map__8156__$1 = cljs.core.__destructure_map.call(null,map__8156);
var f = map__8156__$1;
var expr = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var max_fixed_arity = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"fixed-arity","fixed-arity",1586445869));
var variadic = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"variadic?","variadic?",584179762));
var type = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"type","type",1174270348));
var name = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var params = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"params","params",710516235));
var env = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var recurs = cljs.core.get.call(null,map__8156__$1,new cljs.core.Keyword(null,"recurs","recurs",-1959309309));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

var name_8165__$1 = (function (){var or__1513__auto__ = name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.gensym.call(null);
}
})();
var mname_8166 = cljs.compiler.munge.call(null,name_8165__$1);
var delegate_name_8167 = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(mname_8166)+"__delegate");
var async_8168 = new cljs.core.Keyword(null,"async","async",1050769601).cljs$core$IFn$_invoke$arity$1(env);
cljs.compiler.emitln.call(null,"(function() { ");

cljs.compiler.emits.call(null,"var ",delegate_name_8167," = ",(cljs.core.truth_(async_8168)?"async ":null),"function (");

var seq__8157_8169 = cljs.core.seq.call(null,params);
var chunk__8158_8170 = null;
var count__8159_8171 = (0);
var i__8160_8172 = (0);
while(true){
if((i__8160_8172 < count__8159_8171)){
var param_8173 = cljs.core._nth.call(null,chunk__8158_8170,i__8160_8172);
cljs.compiler.emit.call(null,param_8173);

if(cljs.core._EQ_.call(null,param_8173,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8174 = seq__8157_8169;
var G__8175 = chunk__8158_8170;
var G__8176 = count__8159_8171;
var G__8177 = (i__8160_8172 + (1));
seq__8157_8169 = G__8174;
chunk__8158_8170 = G__8175;
count__8159_8171 = G__8176;
i__8160_8172 = G__8177;
continue;
} else {
var temp__5720__auto___8178 = cljs.core.seq.call(null,seq__8157_8169);
if(temp__5720__auto___8178){
var seq__8157_8179__$1 = temp__5720__auto___8178;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8157_8179__$1)){
var c__2045__auto___8180 = cljs.core.chunk_first.call(null,seq__8157_8179__$1);
var G__8181 = cljs.core.chunk_rest.call(null,seq__8157_8179__$1);
var G__8182 = c__2045__auto___8180;
var G__8183 = cljs.core.count.call(null,c__2045__auto___8180);
var G__8184 = (0);
seq__8157_8169 = G__8181;
chunk__8158_8170 = G__8182;
count__8159_8171 = G__8183;
i__8160_8172 = G__8184;
continue;
} else {
var param_8185 = cljs.core.first.call(null,seq__8157_8179__$1);
cljs.compiler.emit.call(null,param_8185);

if(cljs.core._EQ_.call(null,param_8185,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8186 = cljs.core.next.call(null,seq__8157_8179__$1);
var G__8187 = null;
var G__8188 = (0);
var G__8189 = (0);
seq__8157_8169 = G__8186;
chunk__8158_8170 = G__8187;
count__8159_8171 = G__8188;
i__8160_8172 = G__8189;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"){");

if(cljs.core.truth_(type)){
cljs.compiler.emitln.call(null,"var self__ = this;");
} else {
}

if(cljs.core.truth_(recurs)){
cljs.compiler.emitln.call(null,"while(true){");
} else {
}

cljs.compiler.emits.call(null,expr);

if(cljs.core.truth_(recurs)){
cljs.compiler.emitln.call(null,"break;");

cljs.compiler.emitln.call(null,"}");
} else {
}

cljs.compiler.emitln.call(null,"};");

cljs.compiler.emitln.call(null,"var ",mname_8166," = ",(cljs.core.truth_(async_8168)?"async ":null),"function (",cljs.compiler.comma_sep.call(null,(cljs.core.truth_(variadic)?cljs.core.concat.call(null,cljs.core.butlast.call(null,params),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Symbol(null,"var_args","var_args",1214280389,null)], null)):params)),"){");

if(cljs.core.truth_(type)){
cljs.compiler.emitln.call(null,"var self__ = this;");
} else {
}

if(cljs.core.truth_(variadic)){
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,cljs.core.last.call(null,params));

cljs.compiler.emitln.call(null," = null;");

cljs.compiler.emitln.call(null,"if (arguments.length > ",(cljs.core.count.call(null,params) - (1)),") {");

var a_8190 = cljs.compiler.emit_arguments_to_array.call(null,(cljs.core.count.call(null,params) - (1)));
cljs.compiler.emitln.call(null,"  ",cljs.core.last.call(null,params)," = new cljs.core.IndexedSeq(",a_8190,",0,null);");

cljs.compiler.emitln.call(null,"} ");
} else {
}

cljs.compiler.emits.call(null,"return ",delegate_name_8167,".call(this,");

var seq__8161_8191 = cljs.core.seq.call(null,params);
var chunk__8162_8192 = null;
var count__8163_8193 = (0);
var i__8164_8194 = (0);
while(true){
if((i__8164_8194 < count__8163_8193)){
var param_8195 = cljs.core._nth.call(null,chunk__8162_8192,i__8164_8194);
cljs.compiler.emit.call(null,param_8195);

if(cljs.core._EQ_.call(null,param_8195,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8196 = seq__8161_8191;
var G__8197 = chunk__8162_8192;
var G__8198 = count__8163_8193;
var G__8199 = (i__8164_8194 + (1));
seq__8161_8191 = G__8196;
chunk__8162_8192 = G__8197;
count__8163_8193 = G__8198;
i__8164_8194 = G__8199;
continue;
} else {
var temp__5720__auto___8200 = cljs.core.seq.call(null,seq__8161_8191);
if(temp__5720__auto___8200){
var seq__8161_8201__$1 = temp__5720__auto___8200;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8161_8201__$1)){
var c__2045__auto___8202 = cljs.core.chunk_first.call(null,seq__8161_8201__$1);
var G__8203 = cljs.core.chunk_rest.call(null,seq__8161_8201__$1);
var G__8204 = c__2045__auto___8202;
var G__8205 = cljs.core.count.call(null,c__2045__auto___8202);
var G__8206 = (0);
seq__8161_8191 = G__8203;
chunk__8162_8192 = G__8204;
count__8163_8193 = G__8205;
i__8164_8194 = G__8206;
continue;
} else {
var param_8207 = cljs.core.first.call(null,seq__8161_8201__$1);
cljs.compiler.emit.call(null,param_8207);

if(cljs.core._EQ_.call(null,param_8207,cljs.core.last.call(null,params))){
} else {
cljs.compiler.emits.call(null,",");
}


var G__8208 = cljs.core.next.call(null,seq__8161_8201__$1);
var G__8209 = null;
var G__8210 = (0);
var G__8211 = (0);
seq__8161_8191 = G__8208;
chunk__8162_8192 = G__8209;
count__8163_8193 = G__8210;
i__8164_8194 = G__8211;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emits.call(null,");");

cljs.compiler.emitln.call(null,"};");

cljs.compiler.emitln.call(null,mname_8166,".cljs$lang$maxFixedArity = ",max_fixed_arity,";");

cljs.compiler.emits.call(null,mname_8166,".cljs$lang$applyTo = ");

cljs.compiler.emit_apply_to.call(null,cljs.core.assoc.call(null,f,new cljs.core.Keyword(null,"name","name",1843675177),name_8165__$1));

cljs.compiler.emitln.call(null,";");

cljs.compiler.emitln.call(null,mname_8166,".cljs$core$IFn$_invoke$arity$variadic = ",delegate_name_8167,";");

cljs.compiler.emitln.call(null,"return ",mname_8166,";");

cljs.compiler.emitln.call(null,"})()");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"fn","fn",-1175266204),(function (p__8215){
var map__8216 = p__8215;
var map__8216__$1 = cljs.core.__destructure_map.call(null,map__8216);
var variadic = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"variadic?","variadic?",584179762));
var name = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var env = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var methods$ = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"methods","methods",453930866));
var max_fixed_arity = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"max-fixed-arity","max-fixed-arity",-690205543));
var recur_frames = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"recur-frames","recur-frames",-307205196));
var in_loop = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"in-loop","in-loop",-187298246));
var loop_lets = cljs.core.get.call(null,map__8216__$1,new cljs.core.Keyword(null,"loop-lets","loop-lets",2036794185));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"statement","statement",-32780863),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
return null;
} else {
var recur_params = cljs.core.mapcat.call(null,new cljs.core.Keyword(null,"params","params",710516235),cljs.core.filter.call(null,(function (p1__8212_SHARP_){
var and__1511__auto__ = p1__8212_SHARP_;
if(cljs.core.truth_(and__1511__auto__)){
return cljs.core.deref.call(null,new cljs.core.Keyword(null,"flag","flag",1088647881).cljs$core$IFn$_invoke$arity$1(p1__8212_SHARP_));
} else {
return and__1511__auto__;
}
}),recur_frames));
var loop_locals = cljs.core.seq.call(null,cljs.core.map.call(null,cljs.compiler.munge,cljs.core.concat.call(null,recur_params,(cljs.core.truth_((function (){var or__1513__auto__ = in_loop;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.seq.call(null,recur_params);
}
})())?cljs.core.mapcat.call(null,new cljs.core.Keyword(null,"params","params",710516235),loop_lets):null))));
var async = new cljs.core.Keyword(null,"async","async",1050769601).cljs$core$IFn$_invoke$arity$1(env);
if(loop_locals){
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emitln.call(null,"((function (",cljs.compiler.comma_sep.call(null,cljs.core.map.call(null,cljs.compiler.munge,loop_locals)),"){");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
} else {
cljs.compiler.emits.call(null,"return ");
}
} else {
}

if(cljs.core._EQ_.call(null,(1),cljs.core.count.call(null,methods$))){
if(cljs.core.truth_(variadic)){
cljs.compiler.emit_variadic_fn_method.call(null,cljs.core.assoc.call(null,cljs.core.first.call(null,methods$),new cljs.core.Keyword(null,"name","name",1843675177),name));
} else {
cljs.compiler.emit_fn_method.call(null,cljs.core.assoc.call(null,cljs.core.first.call(null,methods$),new cljs.core.Keyword(null,"name","name",1843675177),name));
}
} else {
var name_8268__$1 = (function (){var or__1513__auto__ = name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.gensym.call(null);
}
})();
var mname_8269 = cljs.compiler.munge.call(null,name_8268__$1);
var maxparams_8270 = cljs.core.apply.call(null,cljs.core.max_key,cljs.core.count,cljs.core.map.call(null,new cljs.core.Keyword(null,"params","params",710516235),methods$));
var mmap_8271 = cljs.core.into.call(null,cljs.core.PersistentArrayMap.EMPTY,cljs.core.map.call(null,(function (method){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.compiler.munge.call(null,cljs.core.symbol.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(mname_8269)+"__"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(method)))))),method], null);
}),methods$));
var ms_8272 = cljs.core.sort_by.call(null,(function (p1__8213_SHARP_){
return cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(cljs.core.second.call(null,p1__8213_SHARP_)));
}),cljs.core.seq.call(null,mmap_8271));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emitln.call(null,"(function() {");

cljs.compiler.emitln.call(null,"var ",mname_8269," = null;");

var seq__8217_8273 = cljs.core.seq.call(null,ms_8272);
var chunk__8218_8274 = null;
var count__8219_8275 = (0);
var i__8220_8276 = (0);
while(true){
if((i__8220_8276 < count__8219_8275)){
var vec__8227_8277 = cljs.core._nth.call(null,chunk__8218_8274,i__8220_8276);
var n_8278 = cljs.core.nth.call(null,vec__8227_8277,(0),null);
var meth_8279 = cljs.core.nth.call(null,vec__8227_8277,(1),null);
cljs.compiler.emits.call(null,"var ",n_8278," = ");

if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8279))){
cljs.compiler.emit_variadic_fn_method.call(null,meth_8279);
} else {
cljs.compiler.emit_fn_method.call(null,meth_8279);
}

cljs.compiler.emitln.call(null,";");


var G__8280 = seq__8217_8273;
var G__8281 = chunk__8218_8274;
var G__8282 = count__8219_8275;
var G__8283 = (i__8220_8276 + (1));
seq__8217_8273 = G__8280;
chunk__8218_8274 = G__8281;
count__8219_8275 = G__8282;
i__8220_8276 = G__8283;
continue;
} else {
var temp__5720__auto___8284 = cljs.core.seq.call(null,seq__8217_8273);
if(temp__5720__auto___8284){
var seq__8217_8285__$1 = temp__5720__auto___8284;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8217_8285__$1)){
var c__2045__auto___8286 = cljs.core.chunk_first.call(null,seq__8217_8285__$1);
var G__8287 = cljs.core.chunk_rest.call(null,seq__8217_8285__$1);
var G__8288 = c__2045__auto___8286;
var G__8289 = cljs.core.count.call(null,c__2045__auto___8286);
var G__8290 = (0);
seq__8217_8273 = G__8287;
chunk__8218_8274 = G__8288;
count__8219_8275 = G__8289;
i__8220_8276 = G__8290;
continue;
} else {
var vec__8230_8291 = cljs.core.first.call(null,seq__8217_8285__$1);
var n_8292 = cljs.core.nth.call(null,vec__8230_8291,(0),null);
var meth_8293 = cljs.core.nth.call(null,vec__8230_8291,(1),null);
cljs.compiler.emits.call(null,"var ",n_8292," = ");

if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8293))){
cljs.compiler.emit_variadic_fn_method.call(null,meth_8293);
} else {
cljs.compiler.emit_fn_method.call(null,meth_8293);
}

cljs.compiler.emitln.call(null,";");


var G__8294 = cljs.core.next.call(null,seq__8217_8285__$1);
var G__8295 = null;
var G__8296 = (0);
var G__8297 = (0);
seq__8217_8273 = G__8294;
chunk__8218_8274 = G__8295;
count__8219_8275 = G__8296;
i__8220_8276 = G__8297;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,mname_8269," = ",(cljs.core.truth_(async)?"async ":null),"function(",cljs.compiler.comma_sep.call(null,(cljs.core.truth_(variadic)?cljs.core.concat.call(null,cljs.core.butlast.call(null,maxparams_8270),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Symbol(null,"var_args","var_args",1214280389,null)], null)):maxparams_8270)),"){");

if(cljs.core.truth_(variadic)){
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,cljs.core.last.call(null,maxparams_8270));

cljs.compiler.emitln.call(null," = var_args;");
} else {
}

cljs.compiler.emitln.call(null,"switch(arguments.length){");

var seq__8233_8298 = cljs.core.seq.call(null,ms_8272);
var chunk__8234_8299 = null;
var count__8235_8300 = (0);
var i__8236_8301 = (0);
while(true){
if((i__8236_8301 < count__8235_8300)){
var vec__8243_8302 = cljs.core._nth.call(null,chunk__8234_8299,i__8236_8301);
var n_8303 = cljs.core.nth.call(null,vec__8243_8302,(0),null);
var meth_8304 = cljs.core.nth.call(null,vec__8243_8302,(1),null);
if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8304))){
cljs.compiler.emitln.call(null,"default:");

var restarg_8305 = cljs.compiler.munge.call(null,cljs.core.gensym.call(null));
cljs.compiler.emitln.call(null,"var ",restarg_8305," = null;");

cljs.compiler.emitln.call(null,"if (arguments.length > ",max_fixed_arity,") {");

var a_8306 = cljs.compiler.emit_arguments_to_array.call(null,max_fixed_arity);
cljs.compiler.emitln.call(null,restarg_8305," = new cljs.core.IndexedSeq(",a_8306,",0,null);");

cljs.compiler.emitln.call(null,"}");

cljs.compiler.emitln.call(null,"return ",n_8303,".cljs$core$IFn$_invoke$arity$variadic(",cljs.compiler.comma_sep.call(null,cljs.core.butlast.call(null,maxparams_8270)),(((cljs.core.count.call(null,maxparams_8270) > (1)))?", ":null),restarg_8305,");");
} else {
var pcnt_8307 = cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(meth_8304));
cljs.compiler.emitln.call(null,"case ",pcnt_8307,":");

cljs.compiler.emitln.call(null,"return ",n_8303,".call(this",(((pcnt_8307 === (0)))?null:(new cljs.core.List(null,",",(new cljs.core.List(null,cljs.compiler.comma_sep.call(null,cljs.core.take.call(null,pcnt_8307,maxparams_8270)),null,(1),null)),(2),null))),");");
}


var G__8308 = seq__8233_8298;
var G__8309 = chunk__8234_8299;
var G__8310 = count__8235_8300;
var G__8311 = (i__8236_8301 + (1));
seq__8233_8298 = G__8308;
chunk__8234_8299 = G__8309;
count__8235_8300 = G__8310;
i__8236_8301 = G__8311;
continue;
} else {
var temp__5720__auto___8312 = cljs.core.seq.call(null,seq__8233_8298);
if(temp__5720__auto___8312){
var seq__8233_8313__$1 = temp__5720__auto___8312;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8233_8313__$1)){
var c__2045__auto___8314 = cljs.core.chunk_first.call(null,seq__8233_8313__$1);
var G__8315 = cljs.core.chunk_rest.call(null,seq__8233_8313__$1);
var G__8316 = c__2045__auto___8314;
var G__8317 = cljs.core.count.call(null,c__2045__auto___8314);
var G__8318 = (0);
seq__8233_8298 = G__8315;
chunk__8234_8299 = G__8316;
count__8235_8300 = G__8317;
i__8236_8301 = G__8318;
continue;
} else {
var vec__8246_8319 = cljs.core.first.call(null,seq__8233_8313__$1);
var n_8320 = cljs.core.nth.call(null,vec__8246_8319,(0),null);
var meth_8321 = cljs.core.nth.call(null,vec__8246_8319,(1),null);
if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8321))){
cljs.compiler.emitln.call(null,"default:");

var restarg_8322 = cljs.compiler.munge.call(null,cljs.core.gensym.call(null));
cljs.compiler.emitln.call(null,"var ",restarg_8322," = null;");

cljs.compiler.emitln.call(null,"if (arguments.length > ",max_fixed_arity,") {");

var a_8323 = cljs.compiler.emit_arguments_to_array.call(null,max_fixed_arity);
cljs.compiler.emitln.call(null,restarg_8322," = new cljs.core.IndexedSeq(",a_8323,",0,null);");

cljs.compiler.emitln.call(null,"}");

cljs.compiler.emitln.call(null,"return ",n_8320,".cljs$core$IFn$_invoke$arity$variadic(",cljs.compiler.comma_sep.call(null,cljs.core.butlast.call(null,maxparams_8270)),(((cljs.core.count.call(null,maxparams_8270) > (1)))?", ":null),restarg_8322,");");
} else {
var pcnt_8324 = cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(meth_8321));
cljs.compiler.emitln.call(null,"case ",pcnt_8324,":");

cljs.compiler.emitln.call(null,"return ",n_8320,".call(this",(((pcnt_8324 === (0)))?null:(new cljs.core.List(null,",",(new cljs.core.List(null,cljs.compiler.comma_sep.call(null,cljs.core.take.call(null,pcnt_8324,maxparams_8270)),null,(1),null)),(2),null))),");");
}


var G__8325 = cljs.core.next.call(null,seq__8233_8313__$1);
var G__8326 = null;
var G__8327 = (0);
var G__8328 = (0);
seq__8233_8298 = G__8325;
chunk__8234_8299 = G__8326;
count__8235_8300 = G__8327;
i__8236_8301 = G__8328;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"}");

var arg_count_js_8329 = ((cljs.core._EQ_.call(null,new cljs.core.Symbol(null,"self__","self__",-153190816,null),new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(cljs.core.first.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(cljs.core.val.call(null,cljs.core.first.call(null,ms_8272)))))))?"(arguments.length - 1)":"arguments.length");
cljs.compiler.emitln.call(null,"throw(new Error('Invalid arity: ' + ",arg_count_js_8329,"));");

cljs.compiler.emitln.call(null,"};");

if(cljs.core.truth_(variadic)){
cljs.compiler.emitln.call(null,mname_8269,".cljs$lang$maxFixedArity = ",max_fixed_arity,";");

cljs.compiler.emitln.call(null,mname_8269,".cljs$lang$applyTo = ",cljs.core.some.call(null,(function (p1__8214_SHARP_){
var vec__8249 = p1__8214_SHARP_;
var n = cljs.core.nth.call(null,vec__8249,(0),null);
var m = cljs.core.nth.call(null,vec__8249,(1),null);
if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(m))){
return n;
} else {
return null;
}
}),ms_8272),".cljs$lang$applyTo;");
} else {
}

var seq__8252_8330 = cljs.core.seq.call(null,ms_8272);
var chunk__8253_8331 = null;
var count__8254_8332 = (0);
var i__8255_8333 = (0);
while(true){
if((i__8255_8333 < count__8254_8332)){
var vec__8262_8334 = cljs.core._nth.call(null,chunk__8253_8331,i__8255_8333);
var n_8335 = cljs.core.nth.call(null,vec__8262_8334,(0),null);
var meth_8336 = cljs.core.nth.call(null,vec__8262_8334,(1),null);
var c_8337 = cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(meth_8336));
if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8336))){
cljs.compiler.emitln.call(null,mname_8269,".cljs$core$IFn$_invoke$arity$variadic = ",n_8335,".cljs$core$IFn$_invoke$arity$variadic;");
} else {
cljs.compiler.emitln.call(null,mname_8269,".cljs$core$IFn$_invoke$arity$",c_8337," = ",n_8335,";");
}


var G__8338 = seq__8252_8330;
var G__8339 = chunk__8253_8331;
var G__8340 = count__8254_8332;
var G__8341 = (i__8255_8333 + (1));
seq__8252_8330 = G__8338;
chunk__8253_8331 = G__8339;
count__8254_8332 = G__8340;
i__8255_8333 = G__8341;
continue;
} else {
var temp__5720__auto___8342 = cljs.core.seq.call(null,seq__8252_8330);
if(temp__5720__auto___8342){
var seq__8252_8343__$1 = temp__5720__auto___8342;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8252_8343__$1)){
var c__2045__auto___8344 = cljs.core.chunk_first.call(null,seq__8252_8343__$1);
var G__8345 = cljs.core.chunk_rest.call(null,seq__8252_8343__$1);
var G__8346 = c__2045__auto___8344;
var G__8347 = cljs.core.count.call(null,c__2045__auto___8344);
var G__8348 = (0);
seq__8252_8330 = G__8345;
chunk__8253_8331 = G__8346;
count__8254_8332 = G__8347;
i__8255_8333 = G__8348;
continue;
} else {
var vec__8265_8349 = cljs.core.first.call(null,seq__8252_8343__$1);
var n_8350 = cljs.core.nth.call(null,vec__8265_8349,(0),null);
var meth_8351 = cljs.core.nth.call(null,vec__8265_8349,(1),null);
var c_8352 = cljs.core.count.call(null,new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(meth_8351));
if(cljs.core.truth_(new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(meth_8351))){
cljs.compiler.emitln.call(null,mname_8269,".cljs$core$IFn$_invoke$arity$variadic = ",n_8350,".cljs$core$IFn$_invoke$arity$variadic;");
} else {
cljs.compiler.emitln.call(null,mname_8269,".cljs$core$IFn$_invoke$arity$",c_8352," = ",n_8350,";");
}


var G__8353 = cljs.core.next.call(null,seq__8252_8343__$1);
var G__8354 = null;
var G__8355 = (0);
var G__8356 = (0);
seq__8252_8330 = G__8353;
chunk__8253_8331 = G__8354;
count__8254_8332 = G__8355;
i__8255_8333 = G__8356;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"return ",mname_8269,";");

cljs.compiler.emitln.call(null,"})()");
}

if(loop_locals){
return cljs.compiler.emitln.call(null,";})(",cljs.compiler.comma_sep.call(null,loop_locals),"))");
} else {
return null;
}
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"do","do",46310725),(function (p__8357){
var map__8358 = p__8357;
var map__8358__$1 = cljs.core.__destructure_map.call(null,map__8358);
var statements = cljs.core.get.call(null,map__8358__$1,new cljs.core.Keyword(null,"statements","statements",600349855));
var ret = cljs.core.get.call(null,map__8358__$1,new cljs.core.Keyword(null,"ret","ret",-468222814));
var env = cljs.core.get.call(null,map__8358__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var context = new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env);
if(((cljs.core.seq.call(null,statements)) && (cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)))){
cljs.compiler.emitln.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

var seq__8359_8363 = cljs.core.seq.call(null,statements);
var chunk__8360_8364 = null;
var count__8361_8365 = (0);
var i__8362_8366 = (0);
while(true){
if((i__8362_8366 < count__8361_8365)){
var s_8367 = cljs.core._nth.call(null,chunk__8360_8364,i__8362_8366);
cljs.compiler.emitln.call(null,s_8367);


var G__8368 = seq__8359_8363;
var G__8369 = chunk__8360_8364;
var G__8370 = count__8361_8365;
var G__8371 = (i__8362_8366 + (1));
seq__8359_8363 = G__8368;
chunk__8360_8364 = G__8369;
count__8361_8365 = G__8370;
i__8362_8366 = G__8371;
continue;
} else {
var temp__5720__auto___8372 = cljs.core.seq.call(null,seq__8359_8363);
if(temp__5720__auto___8372){
var seq__8359_8373__$1 = temp__5720__auto___8372;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8359_8373__$1)){
var c__2045__auto___8374 = cljs.core.chunk_first.call(null,seq__8359_8373__$1);
var G__8375 = cljs.core.chunk_rest.call(null,seq__8359_8373__$1);
var G__8376 = c__2045__auto___8374;
var G__8377 = cljs.core.count.call(null,c__2045__auto___8374);
var G__8378 = (0);
seq__8359_8363 = G__8375;
chunk__8360_8364 = G__8376;
count__8361_8365 = G__8377;
i__8362_8366 = G__8378;
continue;
} else {
var s_8379 = cljs.core.first.call(null,seq__8359_8373__$1);
cljs.compiler.emitln.call(null,s_8379);


var G__8380 = cljs.core.next.call(null,seq__8359_8373__$1);
var G__8381 = null;
var G__8382 = (0);
var G__8383 = (0);
seq__8359_8363 = G__8380;
chunk__8360_8364 = G__8381;
count__8361_8365 = G__8382;
i__8362_8366 = G__8383;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emit.call(null,ret);

if(((cljs.core.seq.call(null,statements)) && (cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)))){
return cljs.compiler.emitln.call(null,cljs.compiler.iife_close.call(null,env));
} else {
return null;
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"try","try",1380742522),(function (p__8384){
var map__8385 = p__8384;
var map__8385__$1 = cljs.core.__destructure_map.call(null,map__8385);
var try$ = cljs.core.get.call(null,map__8385__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var env = cljs.core.get.call(null,map__8385__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var catch$ = cljs.core.get.call(null,map__8385__$1,new cljs.core.Keyword(null,"catch","catch",1038065524));
var name = cljs.core.get.call(null,map__8385__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var finally$ = cljs.core.get.call(null,map__8385__$1,new cljs.core.Keyword(null,"finally","finally",1589088705));
var context = new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env);
if(cljs.core.truth_((function (){var or__1513__auto__ = name;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return finally$;
}
})())){
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
cljs.compiler.emits.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

cljs.compiler.emits.call(null,"try{",try$,"}");

if(cljs.core.truth_(name)){
cljs.compiler.emits.call(null,"catch (",cljs.compiler.munge.call(null,name),"){",catch$,"}");
} else {
}

if(cljs.core.truth_(finally$)){
if(cljs.core.not_EQ_.call(null,new cljs.core.Keyword(null,"const","const",1709929842),new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(cljs.analyzer.unwrap_quote.call(null,finally$)))){
} else {
throw (new Error((""+"Assert failed: "+"finally block cannot contain constant"+"\n"+"(not= :const (:op (ana/unwrap-quote finally)))")));
}

cljs.compiler.emits.call(null,"finally {",finally$,"}");
} else {
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
return cljs.compiler.emits.call(null,cljs.compiler.iife_close.call(null,env));
} else {
return null;
}
} else {
return cljs.compiler.emits.call(null,try$);
}
}));
cljs.compiler.emit_let = (function cljs$compiler$emit_let(p__8386,is_loop){
var map__8387 = p__8386;
var map__8387__$1 = cljs.core.__destructure_map.call(null,map__8387);
var expr = cljs.core.get.call(null,map__8387__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var bindings = cljs.core.get.call(null,map__8387__$1,new cljs.core.Keyword(null,"bindings","bindings",1271397192));
var env = cljs.core.get.call(null,map__8387__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var context = new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env);
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
cljs.compiler.emits.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

var _STAR_lexical_renames_STAR__orig_val__8388_8398 = cljs.compiler._STAR_lexical_renames_STAR_;
var _STAR_lexical_renames_STAR__temp_val__8389_8399 = cljs.core.into.call(null,cljs.compiler._STAR_lexical_renames_STAR_,((cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"statement","statement",-32780863),context))?cljs.core.map.call(null,(function (binding){
var name = new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(binding);
return (new cljs.core.PersistentVector(null,2,(5),cljs.core.PersistentVector.EMPTY_NODE,[cljs.compiler.hash_scope.call(null,binding),cljs.core.gensym.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(name)+"-"))],null));
}),bindings):null));
(cljs.compiler._STAR_lexical_renames_STAR_ = _STAR_lexical_renames_STAR__temp_val__8389_8399);

try{var seq__8390_8400 = cljs.core.seq.call(null,bindings);
var chunk__8391_8401 = null;
var count__8392_8402 = (0);
var i__8393_8403 = (0);
while(true){
if((i__8393_8403 < count__8392_8402)){
var map__8396_8404 = cljs.core._nth.call(null,chunk__8391_8401,i__8393_8403);
var map__8396_8405__$1 = cljs.core.__destructure_map.call(null,map__8396_8404);
var binding_8406 = map__8396_8405__$1;
var init_8407 = cljs.core.get.call(null,map__8396_8405__$1,new cljs.core.Keyword(null,"init","init",-1875481434));
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,binding_8406);

cljs.compiler.emitln.call(null," = ",init_8407,";");


var G__8408 = seq__8390_8400;
var G__8409 = chunk__8391_8401;
var G__8410 = count__8392_8402;
var G__8411 = (i__8393_8403 + (1));
seq__8390_8400 = G__8408;
chunk__8391_8401 = G__8409;
count__8392_8402 = G__8410;
i__8393_8403 = G__8411;
continue;
} else {
var temp__5720__auto___8412 = cljs.core.seq.call(null,seq__8390_8400);
if(temp__5720__auto___8412){
var seq__8390_8413__$1 = temp__5720__auto___8412;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8390_8413__$1)){
var c__2045__auto___8414 = cljs.core.chunk_first.call(null,seq__8390_8413__$1);
var G__8415 = cljs.core.chunk_rest.call(null,seq__8390_8413__$1);
var G__8416 = c__2045__auto___8414;
var G__8417 = cljs.core.count.call(null,c__2045__auto___8414);
var G__8418 = (0);
seq__8390_8400 = G__8415;
chunk__8391_8401 = G__8416;
count__8392_8402 = G__8417;
i__8393_8403 = G__8418;
continue;
} else {
var map__8397_8419 = cljs.core.first.call(null,seq__8390_8413__$1);
var map__8397_8420__$1 = cljs.core.__destructure_map.call(null,map__8397_8419);
var binding_8421 = map__8397_8420__$1;
var init_8422 = cljs.core.get.call(null,map__8397_8420__$1,new cljs.core.Keyword(null,"init","init",-1875481434));
cljs.compiler.emits.call(null,"var ");

cljs.compiler.emit.call(null,binding_8421);

cljs.compiler.emitln.call(null," = ",init_8422,";");


var G__8423 = cljs.core.next.call(null,seq__8390_8413__$1);
var G__8424 = null;
var G__8425 = (0);
var G__8426 = (0);
seq__8390_8400 = G__8423;
chunk__8391_8401 = G__8424;
count__8392_8402 = G__8425;
i__8393_8403 = G__8426;
continue;
}
} else {
}
}
break;
}

if(cljs.core.truth_(is_loop)){
cljs.compiler.emitln.call(null,"while(true){");
} else {
}

cljs.compiler.emits.call(null,expr);

if(cljs.core.truth_(is_loop)){
cljs.compiler.emitln.call(null,"break;");

cljs.compiler.emitln.call(null,"}");
} else {
}
}finally {(cljs.compiler._STAR_lexical_renames_STAR_ = _STAR_lexical_renames_STAR__orig_val__8388_8398);
}
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
return cljs.compiler.emits.call(null,cljs.compiler.iife_close.call(null,env));
} else {
return null;
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"let","let",-1282412701),(function (ast){
return cljs.compiler.emit_let.call(null,ast,false);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"loop","loop",-395552849),(function (ast){
return cljs.compiler.emit_let.call(null,ast,true);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"recur","recur",-437573268),(function (p__8427){
var map__8428 = p__8427;
var map__8428__$1 = cljs.core.__destructure_map.call(null,map__8428);
var frame = cljs.core.get.call(null,map__8428__$1,new cljs.core.Keyword(null,"frame","frame",-1711082588));
var exprs = cljs.core.get.call(null,map__8428__$1,new cljs.core.Keyword(null,"exprs","exprs",1795829094));
var env = cljs.core.get.call(null,map__8428__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var temps = cljs.core.vec.call(null,cljs.core.take.call(null,cljs.core.count.call(null,exprs),cljs.core.repeatedly.call(null,cljs.core.gensym)));
var params = new cljs.core.Keyword(null,"params","params",710516235).cljs$core$IFn$_invoke$arity$1(frame);
var n__2113__auto___8429 = cljs.core.count.call(null,exprs);
var i_8430 = (0);
while(true){
if((i_8430 < n__2113__auto___8429)){
cljs.compiler.emitln.call(null,"var ",temps.call(null,i_8430)," = ",exprs.call(null,i_8430),";");

var G__8431 = (i_8430 + (1));
i_8430 = G__8431;
continue;
} else {
}
break;
}

var n__2113__auto___8432 = cljs.core.count.call(null,exprs);
var i_8433 = (0);
while(true){
if((i_8433 < n__2113__auto___8432)){
cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,params.call(null,i_8433))," = ",temps.call(null,i_8433),";");

var G__8434 = (i_8433 + (1));
i_8433 = G__8434;
continue;
} else {
}
break;
}

return cljs.compiler.emitln.call(null,"continue;");
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"letfn","letfn",-2121022354),(function (p__8435){
var map__8436 = p__8435;
var map__8436__$1 = cljs.core.__destructure_map.call(null,map__8436);
var expr = cljs.core.get.call(null,map__8436__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var bindings = cljs.core.get.call(null,map__8436__$1,new cljs.core.Keyword(null,"bindings","bindings",1271397192));
var env = cljs.core.get.call(null,map__8436__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var context = new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env);
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
cljs.compiler.emits.call(null,cljs.compiler.iife_open.call(null,env));
} else {
}

var seq__8437_8445 = cljs.core.seq.call(null,bindings);
var chunk__8438_8446 = null;
var count__8439_8447 = (0);
var i__8440_8448 = (0);
while(true){
if((i__8440_8448 < count__8439_8447)){
var map__8443_8449 = cljs.core._nth.call(null,chunk__8438_8446,i__8440_8448);
var map__8443_8450__$1 = cljs.core.__destructure_map.call(null,map__8443_8449);
var binding_8451 = map__8443_8450__$1;
var init_8452 = cljs.core.get.call(null,map__8443_8450__$1,new cljs.core.Keyword(null,"init","init",-1875481434));
cljs.compiler.emitln.call(null,"var ",cljs.compiler.munge.call(null,binding_8451)," = ",init_8452,";");


var G__8453 = seq__8437_8445;
var G__8454 = chunk__8438_8446;
var G__8455 = count__8439_8447;
var G__8456 = (i__8440_8448 + (1));
seq__8437_8445 = G__8453;
chunk__8438_8446 = G__8454;
count__8439_8447 = G__8455;
i__8440_8448 = G__8456;
continue;
} else {
var temp__5720__auto___8457 = cljs.core.seq.call(null,seq__8437_8445);
if(temp__5720__auto___8457){
var seq__8437_8458__$1 = temp__5720__auto___8457;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8437_8458__$1)){
var c__2045__auto___8459 = cljs.core.chunk_first.call(null,seq__8437_8458__$1);
var G__8460 = cljs.core.chunk_rest.call(null,seq__8437_8458__$1);
var G__8461 = c__2045__auto___8459;
var G__8462 = cljs.core.count.call(null,c__2045__auto___8459);
var G__8463 = (0);
seq__8437_8445 = G__8460;
chunk__8438_8446 = G__8461;
count__8439_8447 = G__8462;
i__8440_8448 = G__8463;
continue;
} else {
var map__8444_8464 = cljs.core.first.call(null,seq__8437_8458__$1);
var map__8444_8465__$1 = cljs.core.__destructure_map.call(null,map__8444_8464);
var binding_8466 = map__8444_8465__$1;
var init_8467 = cljs.core.get.call(null,map__8444_8465__$1,new cljs.core.Keyword(null,"init","init",-1875481434));
cljs.compiler.emitln.call(null,"var ",cljs.compiler.munge.call(null,binding_8466)," = ",init_8467,";");


var G__8468 = cljs.core.next.call(null,seq__8437_8458__$1);
var G__8469 = null;
var G__8470 = (0);
var G__8471 = (0);
seq__8437_8445 = G__8468;
chunk__8438_8446 = G__8469;
count__8439_8447 = G__8470;
i__8440_8448 = G__8471;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emits.call(null,expr);

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),context)){
return cljs.compiler.emits.call(null,cljs.compiler.iife_close.call(null,env));
} else {
return null;
}
}));
cljs.compiler.protocol_prefix = (function cljs$compiler$protocol_prefix(psym){
return cljs.core.symbol.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1((""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(psym)).replace((new RegExp("\\.","g")),"$").replace("/","$"))+"$"));
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"invoke","invoke",1145927159),(function (p__8474){
var map__8475 = p__8474;
var map__8475__$1 = cljs.core.__destructure_map.call(null,map__8475);
var expr = map__8475__$1;
var f = cljs.core.get.call(null,map__8475__$1,new cljs.core.Keyword(null,"fn","fn",-1175266204));
var args = cljs.core.get.call(null,map__8475__$1,new cljs.core.Keyword(null,"args","args",1315556576));
var env = cljs.core.get.call(null,map__8475__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var info = new cljs.core.Keyword(null,"info","info",-317069002).cljs$core$IFn$_invoke$arity$1(f);
var fn_QMARK_ = (function (){var and__1511__auto__ = cljs.analyzer._STAR_cljs_static_fns_STAR_;
if(cljs.core.truth_(and__1511__auto__)){
var and__1511__auto____$1 = cljs.core.not.call(null,new cljs.core.Keyword(null,"dynamic","dynamic",704819571).cljs$core$IFn$_invoke$arity$1(info));
if(and__1511__auto____$1){
return new cljs.core.Keyword(null,"fn-var","fn-var",1086204730).cljs$core$IFn$_invoke$arity$1(info);
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
})();
var protocol = new cljs.core.Keyword(null,"protocol","protocol",652470118).cljs$core$IFn$_invoke$arity$1(info);
var tag = cljs.analyzer.infer_tag.call(null,env,cljs.core.first.call(null,new cljs.core.Keyword(null,"args","args",1315556576).cljs$core$IFn$_invoke$arity$1(expr)));
var proto_QMARK_ = (function (){var and__1511__auto__ = protocol;
if(cljs.core.truth_(and__1511__auto__)){
var and__1511__auto____$1 = tag;
if(cljs.core.truth_(and__1511__auto____$1)){
var or__1513__auto__ = (function (){var and__1511__auto____$2 = cljs.analyzer._STAR_cljs_static_fns_STAR_;
if(cljs.core.truth_(and__1511__auto____$2)){
var and__1511__auto____$3 = protocol;
if(cljs.core.truth_(and__1511__auto____$3)){
return cljs.core._EQ_.call(null,tag,new cljs.core.Symbol(null,"not-native","not-native",-236392494,null));
} else {
return and__1511__auto____$3;
}
} else {
return and__1511__auto____$2;
}
})();
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
var and__1511__auto____$2 = (function (){var or__1513__auto____$1 = cljs.analyzer._STAR_cljs_static_fns_STAR_;
if(cljs.core.truth_(or__1513__auto____$1)){
return or__1513__auto____$1;
} else {
return new cljs.core.Keyword(null,"protocol-inline","protocol-inline",1550487556).cljs$core$IFn$_invoke$arity$1(env);
}
})();
if(cljs.core.truth_(and__1511__auto____$2)){
var or__1513__auto____$1 = cljs.core._EQ_.call(null,protocol,tag);
if(or__1513__auto____$1){
return or__1513__auto____$1;
} else {
var and__1511__auto____$3 = (!(cljs.core.set_QMARK_.call(null,tag)));
if(and__1511__auto____$3){
var and__1511__auto____$4 = cljs.core.not.call(null,new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 11, [new cljs.core.Symbol(null,"clj","clj",980036099,null),"null",new cljs.core.Symbol(null,"boolean","boolean",-278886877,null),"null",new cljs.core.Symbol(null,"object","object",-1179821820,null),"null",new cljs.core.Symbol(null,"any","any",-948528346,null),"null",new cljs.core.Symbol(null,"js","js",-886355190,null),"null",new cljs.core.Symbol(null,"number","number",-1084057331,null),"null",new cljs.core.Symbol(null,"clj-or-nil","clj-or-nil",-2008798668,null),"null",new cljs.core.Symbol(null,"array","array",-440182315,null),"null",new cljs.core.Symbol(null,"string","string",-349010059,null),"null",new cljs.core.Symbol(null,"function","function",-486723946,null),"null",new cljs.core.Symbol(null,"clj-nil","clj-nil",1321798654,null),"null"], null), null).call(null,tag));
if(and__1511__auto____$4){
var temp__5720__auto__ = new cljs.core.Keyword(null,"protocols","protocols",-5615896).cljs$core$IFn$_invoke$arity$1(cljs.analyzer.resolve_existing_var.call(null,env,cljs.core.vary_meta.call(null,tag,cljs.core.assoc,new cljs.core.Keyword("cljs.analyzer","no-resolve","cljs.analyzer/no-resolve",-1872351017),true)));
if(cljs.core.truth_(temp__5720__auto__)){
var ps = temp__5720__auto__;
return ps.call(null,protocol);
} else {
return null;
}
} else {
return and__1511__auto____$4;
}
} else {
return and__1511__auto____$3;
}
}
} else {
return and__1511__auto____$2;
}
}
} else {
return and__1511__auto____$1;
}
} else {
return and__1511__auto__;
}
})();
var first_arg_tag = cljs.analyzer.infer_tag.call(null,env,cljs.core.first.call(null,new cljs.core.Keyword(null,"args","args",1315556576).cljs$core$IFn$_invoke$arity$1(expr)));
var opt_not_QMARK_ = ((cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(info),new cljs.core.Symbol("cljs.core","not","cljs.core/not",100665144,null))) && (cljs.core._EQ_.call(null,first_arg_tag,new cljs.core.Symbol(null,"boolean","boolean",-278886877,null))));
var opt_count_QMARK_ = ((cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(info),new cljs.core.Symbol("cljs.core","count","cljs.core/count",-921270233,null))) && (cljs.core.boolean$.call(null,new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Symbol(null,"array","array",-440182315,null),"null",new cljs.core.Symbol(null,"string","string",-349010059,null),"null"], null), null).call(null,first_arg_tag))));
var ns = new cljs.core.Keyword(null,"ns","ns",441598760).cljs$core$IFn$_invoke$arity$1(info);
var ftag = cljs.analyzer.infer_tag.call(null,env,f);
var js_QMARK_ = (function (){var or__1513__auto__ = cljs.core._EQ_.call(null,ns,new cljs.core.Symbol(null,"js","js",-886355190,null));
if(or__1513__auto__){
return or__1513__auto__;
} else {
var or__1513__auto____$1 = cljs.core._EQ_.call(null,ns,new cljs.core.Symbol(null,"Math","Math",2033287572,null));
if(or__1513__auto____$1){
return or__1513__auto____$1;
} else {
return new cljs.core.Keyword(null,"foreign","foreign",990521149).cljs$core$IFn$_invoke$arity$1(info);
}
}
})();
var goog_QMARK_ = (cljs.core.truth_(ns)?(function (){var or__1513__auto__ = cljs.core._EQ_.call(null,ns,new cljs.core.Symbol(null,"goog","goog",-70603925,null));
if(or__1513__auto__){
return or__1513__auto__;
} else {
var or__1513__auto____$1 = (function (){var temp__5720__auto__ = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(ns));
if(cljs.core.truth_(temp__5720__auto__)){
var ns_str = temp__5720__auto__;
return cljs.core._EQ_.call(null,cljs.core.get.call(null,clojure.string.split.call(null,ns_str,/\./),(0),null),"goog");
} else {
return null;
}
})();
if(cljs.core.truth_(or__1513__auto____$1)){
return or__1513__auto____$1;
} else {
return (!(cljs.core.contains_QMARK_.call(null,new cljs.core.Keyword("cljs.analyzer","namespaces","cljs.analyzer/namespaces",-260788927).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_)),ns)));
}
}
})():null);
var keyword_QMARK_ = (function (){var or__1513__auto__ = cljs.core._EQ_.call(null,new cljs.core.Symbol("cljs.core","Keyword","cljs.core/Keyword",-451434488,null),ftag);
if(or__1513__auto__){
return or__1513__auto__;
} else {
var f__$1 = cljs.analyzer.unwrap_quote.call(null,f);
return ((cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(f__$1),new cljs.core.Keyword(null,"const","const",1709929842))) && ((new cljs.core.Keyword(null,"form","form",-1624062471).cljs$core$IFn$_invoke$arity$1(f__$1) instanceof cljs.core.Keyword)));
}
})();
var vec__8476 = (cljs.core.truth_(fn_QMARK_)?(function (){var arity = cljs.core.count.call(null,args);
var variadic_QMARK_ = new cljs.core.Keyword(null,"variadic?","variadic?",584179762).cljs$core$IFn$_invoke$arity$1(info);
var mps = new cljs.core.Keyword(null,"method-params","method-params",-980792179).cljs$core$IFn$_invoke$arity$1(info);
var mfa = new cljs.core.Keyword(null,"max-fixed-arity","max-fixed-arity",-690205543).cljs$core$IFn$_invoke$arity$1(info);
if(((cljs.core.not.call(null,variadic_QMARK_)) && (cljs.core._EQ_.call(null,cljs.core.count.call(null,mps),(1))))){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [f,null], null);
} else {
if(cljs.core.truth_((function (){var and__1511__auto__ = variadic_QMARK_;
if(cljs.core.truth_(and__1511__auto__)){
return (arity > mfa);
} else {
return and__1511__auto__;
}
})())){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.update_in.call(null,f,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"info","info",-317069002)], null),(function (info__$1){
return cljs.core.update_in.call(null,cljs.core.assoc.call(null,info__$1,new cljs.core.Keyword(null,"name","name",1843675177),cljs.core.symbol.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.munge.call(null,info__$1))+".cljs$core$IFn$_invoke$arity$variadic"))),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"info","info",-317069002)], null),(function (p1__8472_SHARP_){
return cljs.core.dissoc.call(null,cljs.core.dissoc.call(null,p1__8472_SHARP_,new cljs.core.Keyword(null,"shadow","shadow",873231803)),new cljs.core.Keyword(null,"fn-self-name","fn-self-name",1461143531));
}));
})),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"max-fixed-arity","max-fixed-arity",-690205543),mfa], null)], null);
} else {
var arities = cljs.core.map.call(null,cljs.core.count,mps);
if(cljs.core.truth_(cljs.core.some.call(null,cljs.core.PersistentHashSet.createAsIfByAssoc([arity]),arities))){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.update_in.call(null,f,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"info","info",-317069002)], null),(function (info__$1){
return cljs.core.update_in.call(null,cljs.core.assoc.call(null,info__$1,new cljs.core.Keyword(null,"name","name",1843675177),cljs.core.symbol.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.munge.call(null,info__$1))+".cljs$core$IFn$_invoke$arity$"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(arity)))),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"info","info",-317069002)], null),(function (p1__8473_SHARP_){
return cljs.core.dissoc.call(null,cljs.core.dissoc.call(null,p1__8473_SHARP_,new cljs.core.Keyword(null,"shadow","shadow",873231803)),new cljs.core.Keyword(null,"fn-self-name","fn-self-name",1461143531));
}));
})),null], null);
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [f,null], null);
}

}
}
})():new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [f,null], null));
var f__$1 = cljs.core.nth.call(null,vec__8476,(0),null);
var variadic_invoke = cljs.core.nth.call(null,vec__8476,(1),null);
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(opt_not_QMARK_){
cljs.compiler.emits.call(null,"(!(",cljs.core.first.call(null,args),"))");
} else {
if(opt_count_QMARK_){
cljs.compiler.emits.call(null,"((",cljs.core.first.call(null,args),").length)");
} else {
if(cljs.core.truth_(proto_QMARK_)){
var pimpl_8479 = (""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.munge.call(null,cljs.compiler.protocol_prefix.call(null,protocol)))+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.compiler.munge.call(null,cljs.core.name.call(null,new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(info))))+"$arity$"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.count.call(null,args)));
cljs.compiler.emits.call(null,cljs.core.first.call(null,args),".",pimpl_8479,"(",cljs.compiler.comma_sep.call(null,cljs.core.cons.call(null,"null",cljs.core.rest.call(null,args))),")");
} else {
if(keyword_QMARK_){
cljs.compiler.emits.call(null,f__$1,".cljs$core$IFn$_invoke$arity$",cljs.core.count.call(null,args),"(",cljs.compiler.comma_sep.call(null,args),")");
} else {
if(cljs.core.truth_(variadic_invoke)){
var mfa_8480 = new cljs.core.Keyword(null,"max-fixed-arity","max-fixed-arity",-690205543).cljs$core$IFn$_invoke$arity$1(variadic_invoke);
cljs.compiler.emits.call(null,f__$1,"(",cljs.compiler.comma_sep.call(null,cljs.core.take.call(null,mfa_8480,args)),(((mfa_8480 === (0)))?null:","),"cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([",cljs.compiler.comma_sep.call(null,cljs.core.drop.call(null,mfa_8480,args)),"], 0))");
} else {
if(cljs.core.truth_((function (){var or__1513__auto__ = fn_QMARK_;
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
var or__1513__auto____$1 = js_QMARK_;
if(cljs.core.truth_(or__1513__auto____$1)){
return or__1513__auto____$1;
} else {
return goog_QMARK_;
}
}
})())){
cljs.compiler.emits.call(null,f__$1,"(",cljs.compiler.comma_sep.call(null,args),")");
} else {
if(cljs.core.truth_((function (){var and__1511__auto__ = cljs.analyzer._STAR_cljs_static_fns_STAR_;
if(cljs.core.truth_(and__1511__auto__)){
return new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"var","var",-769682797),null,new cljs.core.Keyword(null,"js-var","js-var",-1177899142),null,new cljs.core.Keyword(null,"local","local",-1497766724),null], null), null).call(null,new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(f__$1));
} else {
return and__1511__auto__;
}
})())){
var fprop_8481 = (""+".cljs$core$IFn$_invoke$arity$"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.count.call(null,args)));
if(cljs.core.truth_(cljs.analyzer._STAR_fn_invoke_direct_STAR_)){
cljs.compiler.emits.call(null,"(",f__$1,fprop_8481," ? ",f__$1,fprop_8481,"(",cljs.compiler.comma_sep.call(null,args),") : ",f__$1,"(",cljs.compiler.comma_sep.call(null,args),"))");
} else {
cljs.compiler.emits.call(null,"(",f__$1,fprop_8481," ? ",f__$1,fprop_8481,"(",cljs.compiler.comma_sep.call(null,args),") : ",f__$1,".call(",cljs.compiler.comma_sep.call(null,cljs.core.cons.call(null,"null",args)),"))");
}
} else {
cljs.compiler.emits.call(null,f__$1,".call(",cljs.compiler.comma_sep.call(null,cljs.core.cons.call(null,"null",args)),")");
}

}
}
}
}
}
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"new","new",-2085437848),(function (p__8482){
var map__8483 = p__8482;
var map__8483__$1 = cljs.core.__destructure_map.call(null,map__8483);
var ctor = cljs.core.get.call(null,map__8483__$1,new cljs.core.Keyword(null,"class","class",-2030961996));
var args = cljs.core.get.call(null,map__8483__$1,new cljs.core.Keyword(null,"args","args",1315556576));
var env = cljs.core.get.call(null,map__8483__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"(new ",ctor,"(",cljs.compiler.comma_sep.call(null,args),"))");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"qualified-method","qualified-method",711575717),(function (p__8484){
var map__8485 = p__8484;
var map__8485__$1 = cljs.core.__destructure_map.call(null,map__8485);
var ctor = cljs.core.get.call(null,map__8485__$1,new cljs.core.Keyword(null,"class","class",-2030961996));
var args = cljs.core.get.call(null,map__8485__$1,new cljs.core.Keyword(null,"args","args",1315556576));
var env = cljs.core.get.call(null,map__8485__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var kind = cljs.core.get.call(null,map__8485__$1,new cljs.core.Keyword(null,"kind","kind",-717265803));
var name = cljs.core.get.call(null,map__8485__$1,new cljs.core.Keyword(null,"name","name",1843675177));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"new","new",-2085437848),kind)){
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"(function (...args) { return Reflect.construct(",ctor,", args) })");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
} else {
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"(function (x, ...args) { return Reflect.apply(",ctor,".prototype.",name,", x, args) })");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"set!","set!",-1389817006),(function (p__8486){
var map__8487 = p__8486;
var map__8487__$1 = cljs.core.__destructure_map.call(null,map__8487);
var target = cljs.core.get.call(null,map__8487__$1,new cljs.core.Keyword(null,"target","target",253001721));
var val = cljs.core.get.call(null,map__8487__$1,new cljs.core.Keyword(null,"val","val",128701612));
var env = cljs.core.get.call(null,map__8487__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

cljs.compiler.emits.call(null,"(",target," = ",val,")");

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}));
cljs.compiler.sublib_select = (function cljs$compiler$sublib_select(sublib){
if(cljs.core.truth_(sublib)){
var xs = clojure.string.split.call(null,sublib,/\./);
return cljs.core.apply.call(null,cljs.core.str,cljs.core.map.call(null,(function (p1__8488_SHARP_){
return (""+"['"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(p1__8488_SHARP_)+"']");
}),xs));
} else {
return null;
}
});
cljs.compiler.emit_global_export = (function cljs$compiler$emit_global_export(ns_name,global_exports,lib,opts){
var vec__8489 = cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib);
var lib_SINGLEQUOTE_ = cljs.core.nth.call(null,vec__8489,(0),null);
var sublib = cljs.core.nth.call(null,vec__8489,(1),null);
var ref = (""+"goog.global"+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.call(null,cljs.core.str,cljs.core.map.call(null,(function (prop){
return (""+"[\""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(prop)+"\"]");
}),clojure.string.split.call(null,cljs.core.name.call(null,(function (){var or__1513__auto__ = cljs.core.get.call(null,global_exports,cljs.core.symbol.call(null,lib_SINGLEQUOTE_));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core.get.call(null,global_exports,cljs.core.name.call(null,lib_SINGLEQUOTE_));
}
})()),/\./)))));
if(((cljs.analyzer.external_dep_QMARK_.call(null,lib_SINGLEQUOTE_)) && (cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"none","none",1333468478),new cljs.core.Keyword(null,"optimizations","optimizations",-2047476854).cljs$core$IFn$_invoke$arity$1(opts))))){
cljs.compiler.emitln.call(null,"if(!",ref,") throw new Error(\"External library, ",lib_SINGLEQUOTE_,", never provided\");");
} else {
}

return cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,ns_name),".",cljs.analyzer.munge_global_export.call(null,lib)," = ",ref,cljs.compiler.sublib_select.call(null,sublib),";");
});
cljs.compiler.load_libs = (function cljs$compiler$load_libs(libs,seen,reloads,deps,ns_name){
var map__8492 = cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_);
var map__8492__$1 = cljs.core.__destructure_map.call(null,map__8492);
var options = cljs.core.get.call(null,map__8492__$1,new cljs.core.Keyword(null,"options","options",99638489));
var js_dependency_index = cljs.core.get.call(null,map__8492__$1,new cljs.core.Keyword(null,"js-dependency-index","js-dependency-index",-1887042131));
var map__8493 = options;
var map__8493__$1 = cljs.core.__destructure_map.call(null,map__8493);
var target = cljs.core.get.call(null,map__8493__$1,new cljs.core.Keyword(null,"target","target",253001721));
var nodejs_rt = cljs.core.get.call(null,map__8493__$1,new cljs.core.Keyword(null,"nodejs-rt","nodejs-rt",-512437071));
var optimizations = cljs.core.get.call(null,map__8493__$1,new cljs.core.Keyword(null,"optimizations","optimizations",-2047476854));
var loaded_libs = cljs.compiler.munge.call(null,new cljs.core.Symbol(null,"cljs.core.*loaded-libs*","cljs.core.*loaded-libs*",-1847086525,null));
var loaded_libs_temp = cljs.compiler.munge.call(null,cljs.core.gensym.call(null,new cljs.core.Symbol(null,"cljs.core.*loaded-libs*","cljs.core.*loaded-libs*",-1847086525,null)));
var vec__8494 = (function (){var libs__$1 = cljs.core.remove.call(null,cljs.core.set.call(null,cljs.core.vals.call(null,seen)),cljs.core.filter.call(null,cljs.core.set.call(null,cljs.core.vals.call(null,libs)),deps));
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"nodejs","nodejs",321212524),target)){
var map__8500 = cljs.core.group_by.call(null,cljs.analyzer.node_module_dep_QMARK_,libs__$1);
var map__8500__$1 = cljs.core.__destructure_map.call(null,map__8500);
var node_libs = cljs.core.get.call(null,map__8500__$1,true);
var libs_to_load = cljs.core.get.call(null,map__8500__$1,false);
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [node_libs,libs_to_load], null);
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [null,libs__$1], null);
}
})();
var node_libs = cljs.core.nth.call(null,vec__8494,(0),null);
var libs_to_load = cljs.core.nth.call(null,vec__8494,(1),null);
var vec__8497 = (function (){var map__8501 = cljs.core.group_by.call(null,cljs.analyzer.goog_module_dep_QMARK_,libs_to_load);
var map__8501__$1 = cljs.core.__destructure_map.call(null,map__8501);
var goog_modules = cljs.core.get.call(null,map__8501__$1,true);
var libs_to_load__$1 = cljs.core.get.call(null,map__8501__$1,false);
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [goog_modules,libs_to_load__$1], null);
})();
var goog_modules = cljs.core.nth.call(null,vec__8497,(0),null);
var libs_to_load__$1 = cljs.core.nth.call(null,vec__8497,(1),null);
var global_exports_libs = cljs.core.filter.call(null,cljs.analyzer.dep_has_global_exports_QMARK_,libs_to_load__$1);
if(cljs.core.truth_(new cljs.core.Keyword(null,"reload-all","reload-all",761570200).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs)))){
cljs.compiler.emitln.call(null,"if(!COMPILED) ",loaded_libs_temp," = ",loaded_libs," || cljs.core.set([\"cljs.core\"]);");

cljs.compiler.emitln.call(null,"if(!COMPILED) ",loaded_libs," = cljs.core.set([\"cljs.core\"]);");
} else {
}

var seq__8502_8546 = cljs.core.seq.call(null,libs_to_load__$1);
var chunk__8503_8547 = null;
var count__8504_8548 = (0);
var i__8505_8549 = (0);
while(true){
if((i__8505_8549 < count__8504_8548)){
var lib_8550 = cljs.core._nth.call(null,chunk__8503_8547,i__8505_8549);
if(((cljs.analyzer.foreign_dep_QMARK_.call(null,lib_8550)) && ((!(cljs.core.keyword_identical_QMARK_.call(null,optimizations,new cljs.core.Keyword(null,"none","none",1333468478))))))){
} else {
if(cljs.core.truth_((function (){var or__1513__auto__ = new cljs.core.Keyword(null,"reload","reload",863702807).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core._EQ_.call(null,cljs.core.get.call(null,reloads,lib_8550),new cljs.core.Keyword(null,"reload","reload",863702807));
}
})())){
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8550),"', 'reload');");
} else {
if(cljs.core.truth_((function (){var or__1513__auto__ = new cljs.core.Keyword(null,"reload-all","reload-all",761570200).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core._EQ_.call(null,cljs.core.get.call(null,reloads,lib_8550),new cljs.core.Keyword(null,"reload-all","reload-all",761570200));
}
})())){
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8550),"', 'reload-all');");
} else {
if(cljs.core._EQ_.call(null,lib_8550,new cljs.core.Symbol(null,"goog","goog",-70603925,null))){
} else {
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8550),"');");
}

}
}
}


var G__8551 = seq__8502_8546;
var G__8552 = chunk__8503_8547;
var G__8553 = count__8504_8548;
var G__8554 = (i__8505_8549 + (1));
seq__8502_8546 = G__8551;
chunk__8503_8547 = G__8552;
count__8504_8548 = G__8553;
i__8505_8549 = G__8554;
continue;
} else {
var temp__5720__auto___8555 = cljs.core.seq.call(null,seq__8502_8546);
if(temp__5720__auto___8555){
var seq__8502_8556__$1 = temp__5720__auto___8555;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8502_8556__$1)){
var c__2045__auto___8557 = cljs.core.chunk_first.call(null,seq__8502_8556__$1);
var G__8558 = cljs.core.chunk_rest.call(null,seq__8502_8556__$1);
var G__8559 = c__2045__auto___8557;
var G__8560 = cljs.core.count.call(null,c__2045__auto___8557);
var G__8561 = (0);
seq__8502_8546 = G__8558;
chunk__8503_8547 = G__8559;
count__8504_8548 = G__8560;
i__8505_8549 = G__8561;
continue;
} else {
var lib_8562 = cljs.core.first.call(null,seq__8502_8556__$1);
if(((cljs.analyzer.foreign_dep_QMARK_.call(null,lib_8562)) && ((!(cljs.core.keyword_identical_QMARK_.call(null,optimizations,new cljs.core.Keyword(null,"none","none",1333468478))))))){
} else {
if(cljs.core.truth_((function (){var or__1513__auto__ = new cljs.core.Keyword(null,"reload","reload",863702807).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core._EQ_.call(null,cljs.core.get.call(null,reloads,lib_8562),new cljs.core.Keyword(null,"reload","reload",863702807));
}
})())){
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8562),"', 'reload');");
} else {
if(cljs.core.truth_((function (){var or__1513__auto__ = new cljs.core.Keyword(null,"reload-all","reload-all",761570200).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs));
if(cljs.core.truth_(or__1513__auto__)){
return or__1513__auto__;
} else {
return cljs.core._EQ_.call(null,cljs.core.get.call(null,reloads,lib_8562),new cljs.core.Keyword(null,"reload-all","reload-all",761570200));
}
})())){
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8562),"', 'reload-all');");
} else {
if(cljs.core._EQ_.call(null,lib_8562,new cljs.core.Symbol(null,"goog","goog",-70603925,null))){
} else {
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,lib_8562),"');");
}

}
}
}


var G__8563 = cljs.core.next.call(null,seq__8502_8556__$1);
var G__8564 = null;
var G__8565 = (0);
var G__8566 = (0);
seq__8502_8546 = G__8563;
chunk__8503_8547 = G__8564;
count__8504_8548 = G__8565;
i__8505_8549 = G__8566;
continue;
}
} else {
}
}
break;
}

var seq__8506_8567 = cljs.core.seq.call(null,node_libs);
var chunk__8507_8568 = null;
var count__8508_8569 = (0);
var i__8509_8570 = (0);
while(true){
if((i__8509_8570 < count__8508_8569)){
var lib_8571 = cljs.core._nth.call(null,chunk__8507_8568,i__8509_8570);
var vec__8516_8572 = cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8571);
var lib_SINGLEQUOTE__8573 = cljs.core.nth.call(null,vec__8516_8572,(0),null);
var sublib_8574 = cljs.core.nth.call(null,vec__8516_8572,(1),null);
cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,ns_name),".",cljs.analyzer.munge_node_lib.call(null,lib_8571)," = require('",lib_SINGLEQUOTE__8573,"')",cljs.compiler.sublib_select.call(null,sublib_8574),";");


var G__8575 = seq__8506_8567;
var G__8576 = chunk__8507_8568;
var G__8577 = count__8508_8569;
var G__8578 = (i__8509_8570 + (1));
seq__8506_8567 = G__8575;
chunk__8507_8568 = G__8576;
count__8508_8569 = G__8577;
i__8509_8570 = G__8578;
continue;
} else {
var temp__5720__auto___8579 = cljs.core.seq.call(null,seq__8506_8567);
if(temp__5720__auto___8579){
var seq__8506_8580__$1 = temp__5720__auto___8579;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8506_8580__$1)){
var c__2045__auto___8581 = cljs.core.chunk_first.call(null,seq__8506_8580__$1);
var G__8582 = cljs.core.chunk_rest.call(null,seq__8506_8580__$1);
var G__8583 = c__2045__auto___8581;
var G__8584 = cljs.core.count.call(null,c__2045__auto___8581);
var G__8585 = (0);
seq__8506_8567 = G__8582;
chunk__8507_8568 = G__8583;
count__8508_8569 = G__8584;
i__8509_8570 = G__8585;
continue;
} else {
var lib_8586 = cljs.core.first.call(null,seq__8506_8580__$1);
var vec__8519_8587 = cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8586);
var lib_SINGLEQUOTE__8588 = cljs.core.nth.call(null,vec__8519_8587,(0),null);
var sublib_8589 = cljs.core.nth.call(null,vec__8519_8587,(1),null);
cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,ns_name),".",cljs.analyzer.munge_node_lib.call(null,lib_8586)," = require('",lib_SINGLEQUOTE__8588,"')",cljs.compiler.sublib_select.call(null,sublib_8589),";");


var G__8590 = cljs.core.next.call(null,seq__8506_8580__$1);
var G__8591 = null;
var G__8592 = (0);
var G__8593 = (0);
seq__8506_8567 = G__8590;
chunk__8507_8568 = G__8591;
count__8508_8569 = G__8592;
i__8509_8570 = G__8593;
continue;
}
} else {
}
}
break;
}

var seq__8522_8594 = cljs.core.seq.call(null,goog_modules);
var chunk__8523_8595 = null;
var count__8524_8596 = (0);
var i__8525_8597 = (0);
while(true){
if((i__8525_8597 < count__8524_8596)){
var lib_8598 = cljs.core._nth.call(null,chunk__8523_8595,i__8525_8597);
var vec__8532_8599 = cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8598);
var lib_SINGLEQUOTE__8600 = cljs.core.nth.call(null,vec__8532_8599,(0),null);
var sublib_8601 = cljs.core.nth.call(null,vec__8532_8599,(1),null);
cljs.compiler.emitln.call(null,"goog.require('",lib_SINGLEQUOTE__8600,"');");

cljs.compiler.emitln.call(null,"goog.scope(function(){");

cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,ns_name),".",cljs.analyzer.munge_goog_module_lib.call(null,lib_8598)," = goog.module.get('",lib_SINGLEQUOTE__8600,"')",cljs.compiler.sublib_select.call(null,sublib_8601),";");

cljs.compiler.emitln.call(null,"});");


var G__8602 = seq__8522_8594;
var G__8603 = chunk__8523_8595;
var G__8604 = count__8524_8596;
var G__8605 = (i__8525_8597 + (1));
seq__8522_8594 = G__8602;
chunk__8523_8595 = G__8603;
count__8524_8596 = G__8604;
i__8525_8597 = G__8605;
continue;
} else {
var temp__5720__auto___8606 = cljs.core.seq.call(null,seq__8522_8594);
if(temp__5720__auto___8606){
var seq__8522_8607__$1 = temp__5720__auto___8606;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8522_8607__$1)){
var c__2045__auto___8608 = cljs.core.chunk_first.call(null,seq__8522_8607__$1);
var G__8609 = cljs.core.chunk_rest.call(null,seq__8522_8607__$1);
var G__8610 = c__2045__auto___8608;
var G__8611 = cljs.core.count.call(null,c__2045__auto___8608);
var G__8612 = (0);
seq__8522_8594 = G__8609;
chunk__8523_8595 = G__8610;
count__8524_8596 = G__8611;
i__8525_8597 = G__8612;
continue;
} else {
var lib_8613 = cljs.core.first.call(null,seq__8522_8607__$1);
var vec__8535_8614 = cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8613);
var lib_SINGLEQUOTE__8615 = cljs.core.nth.call(null,vec__8535_8614,(0),null);
var sublib_8616 = cljs.core.nth.call(null,vec__8535_8614,(1),null);
cljs.compiler.emitln.call(null,"goog.require('",lib_SINGLEQUOTE__8615,"');");

cljs.compiler.emitln.call(null,"goog.scope(function(){");

cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,ns_name),".",cljs.analyzer.munge_goog_module_lib.call(null,lib_8613)," = goog.module.get('",lib_SINGLEQUOTE__8615,"')",cljs.compiler.sublib_select.call(null,sublib_8616),";");

cljs.compiler.emitln.call(null,"});");


var G__8617 = cljs.core.next.call(null,seq__8522_8607__$1);
var G__8618 = null;
var G__8619 = (0);
var G__8620 = (0);
seq__8522_8594 = G__8617;
chunk__8523_8595 = G__8618;
count__8524_8596 = G__8619;
i__8525_8597 = G__8620;
continue;
}
} else {
}
}
break;
}

var seq__8538_8621 = cljs.core.seq.call(null,global_exports_libs);
var chunk__8539_8622 = null;
var count__8540_8623 = (0);
var i__8541_8624 = (0);
while(true){
if((i__8541_8624 < count__8540_8623)){
var lib_8625 = cljs.core._nth.call(null,chunk__8539_8622,i__8541_8624);
var map__8544_8626 = cljs.core.get.call(null,js_dependency_index,cljs.core.name.call(null,cljs.core.first.call(null,cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8625))));
var map__8544_8627__$1 = cljs.core.__destructure_map.call(null,map__8544_8626);
var global_exports_8628 = cljs.core.get.call(null,map__8544_8627__$1,new cljs.core.Keyword(null,"global-exports","global-exports",-1644865592));
cljs.compiler.emit_global_export.call(null,ns_name,global_exports_8628,lib_8625,options);


var G__8629 = seq__8538_8621;
var G__8630 = chunk__8539_8622;
var G__8631 = count__8540_8623;
var G__8632 = (i__8541_8624 + (1));
seq__8538_8621 = G__8629;
chunk__8539_8622 = G__8630;
count__8540_8623 = G__8631;
i__8541_8624 = G__8632;
continue;
} else {
var temp__5720__auto___8633 = cljs.core.seq.call(null,seq__8538_8621);
if(temp__5720__auto___8633){
var seq__8538_8634__$1 = temp__5720__auto___8633;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8538_8634__$1)){
var c__2045__auto___8635 = cljs.core.chunk_first.call(null,seq__8538_8634__$1);
var G__8636 = cljs.core.chunk_rest.call(null,seq__8538_8634__$1);
var G__8637 = c__2045__auto___8635;
var G__8638 = cljs.core.count.call(null,c__2045__auto___8635);
var G__8639 = (0);
seq__8538_8621 = G__8636;
chunk__8539_8622 = G__8637;
count__8540_8623 = G__8638;
i__8541_8624 = G__8639;
continue;
} else {
var lib_8640 = cljs.core.first.call(null,seq__8538_8634__$1);
var map__8545_8641 = cljs.core.get.call(null,js_dependency_index,cljs.core.name.call(null,cljs.core.first.call(null,cljs.analyzer.lib_AMPERSAND_sublib.call(null,lib_8640))));
var map__8545_8642__$1 = cljs.core.__destructure_map.call(null,map__8545_8641);
var global_exports_8643 = cljs.core.get.call(null,map__8545_8642__$1,new cljs.core.Keyword(null,"global-exports","global-exports",-1644865592));
cljs.compiler.emit_global_export.call(null,ns_name,global_exports_8643,lib_8640,options);


var G__8644 = cljs.core.next.call(null,seq__8538_8634__$1);
var G__8645 = null;
var G__8646 = (0);
var G__8647 = (0);
seq__8538_8621 = G__8644;
chunk__8539_8622 = G__8645;
count__8540_8623 = G__8646;
i__8541_8624 = G__8647;
continue;
}
} else {
}
}
break;
}

if(cljs.core.truth_(new cljs.core.Keyword(null,"reload-all","reload-all",761570200).cljs$core$IFn$_invoke$arity$1(cljs.core.meta.call(null,libs)))){
return cljs.compiler.emitln.call(null,"if(!COMPILED) ",loaded_libs," = cljs.core.into(",loaded_libs_temp,", ",loaded_libs,");");
} else {
return null;
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"ns*","ns*",200417856),(function (p__8648){
var map__8649 = p__8648;
var map__8649__$1 = cljs.core.__destructure_map.call(null,map__8649);
var name = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var requires = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"requires","requires",-1201390927));
var uses = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"uses","uses",232664692));
var require_macros = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"require-macros","require-macros",707947416));
var reloads = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"reloads","reloads",610698522));
var env = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var deps = cljs.core.get.call(null,map__8649__$1,new cljs.core.Keyword(null,"deps","deps",1883360319));
cljs.compiler.load_libs.call(null,requires,null,new cljs.core.Keyword(null,"require","require",-468001333).cljs$core$IFn$_invoke$arity$1(reloads),deps,name);

cljs.compiler.load_libs.call(null,uses,requires,new cljs.core.Keyword(null,"use","use",-1846382424).cljs$core$IFn$_invoke$arity$1(reloads),deps,name);

if(cljs.core.truth_(new cljs.core.Keyword(null,"repl-env","repl-env",-1976503928).cljs$core$IFn$_invoke$arity$1(env))){
return cljs.compiler.emitln.call(null,"'nil';");
} else {
return null;
}
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"ns","ns",441598760),(function (p__8650){
var map__8651 = p__8650;
var map__8651__$1 = cljs.core.__destructure_map.call(null,map__8651);
var name = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var requires = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"requires","requires",-1201390927));
var uses = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"uses","uses",232664692));
var require_macros = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"require-macros","require-macros",707947416));
var reloads = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"reloads","reloads",610698522));
var env = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var deps = cljs.core.get.call(null,map__8651__$1,new cljs.core.Keyword(null,"deps","deps",1883360319));
cljs.compiler.emitln.call(null,"goog.provide('",cljs.compiler.munge.call(null,name),"');");

if(cljs.core._EQ_.call(null,name,new cljs.core.Symbol(null,"cljs.core","cljs.core",770546058,null))){
} else {
cljs.compiler.emitln.call(null,"goog.require('cljs.core');");

if(cljs.core.truth_(new cljs.core.Keyword(null,"emit-constants","emit-constants",-476585410).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"options","options",99638489).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,cljs.env._STAR_compiler_STAR_))))){
cljs.compiler.emitln.call(null,"goog.require('",cljs.compiler.munge.call(null,cljs.analyzer.constants_ns_sym),"');");
} else {
}
}

cljs.compiler.load_libs.call(null,requires,null,new cljs.core.Keyword(null,"require","require",-468001333).cljs$core$IFn$_invoke$arity$1(reloads),deps,name);

return cljs.compiler.load_libs.call(null,uses,requires,new cljs.core.Keyword(null,"use","use",-1846382424).cljs$core$IFn$_invoke$arity$1(reloads),deps,name);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"deftype","deftype",340294561),(function (p__8652){
var map__8653 = p__8652;
var map__8653__$1 = cljs.core.__destructure_map.call(null,map__8653);
var t = cljs.core.get.call(null,map__8653__$1,new cljs.core.Keyword(null,"t","t",-1397832519));
var fields = cljs.core.get.call(null,map__8653__$1,new cljs.core.Keyword(null,"fields","fields",-1932066230));
var pmasks = cljs.core.get.call(null,map__8653__$1,new cljs.core.Keyword(null,"pmasks","pmasks",-871416698));
var body = cljs.core.get.call(null,map__8653__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var protocols = cljs.core.get.call(null,map__8653__$1,new cljs.core.Keyword(null,"protocols","protocols",-5615896));
var fields__$1 = cljs.core.map.call(null,cljs.compiler.munge,fields);
cljs.compiler.emitln.call(null,"");

cljs.compiler.emitln.call(null,"/**");

cljs.compiler.emitln.call(null,"* @constructor");

var seq__8654_8678 = cljs.core.seq.call(null,protocols);
var chunk__8655_8679 = null;
var count__8656_8680 = (0);
var i__8657_8681 = (0);
while(true){
if((i__8657_8681 < count__8656_8680)){
var protocol_8682 = cljs.core._nth.call(null,chunk__8655_8679,i__8657_8681);
cljs.compiler.emitln.call(null," * @implements {",cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(protocol_8682))),"}");


var G__8683 = seq__8654_8678;
var G__8684 = chunk__8655_8679;
var G__8685 = count__8656_8680;
var G__8686 = (i__8657_8681 + (1));
seq__8654_8678 = G__8683;
chunk__8655_8679 = G__8684;
count__8656_8680 = G__8685;
i__8657_8681 = G__8686;
continue;
} else {
var temp__5720__auto___8687 = cljs.core.seq.call(null,seq__8654_8678);
if(temp__5720__auto___8687){
var seq__8654_8688__$1 = temp__5720__auto___8687;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8654_8688__$1)){
var c__2045__auto___8689 = cljs.core.chunk_first.call(null,seq__8654_8688__$1);
var G__8690 = cljs.core.chunk_rest.call(null,seq__8654_8688__$1);
var G__8691 = c__2045__auto___8689;
var G__8692 = cljs.core.count.call(null,c__2045__auto___8689);
var G__8693 = (0);
seq__8654_8678 = G__8690;
chunk__8655_8679 = G__8691;
count__8656_8680 = G__8692;
i__8657_8681 = G__8693;
continue;
} else {
var protocol_8694 = cljs.core.first.call(null,seq__8654_8688__$1);
cljs.compiler.emitln.call(null," * @implements {",cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(protocol_8694))),"}");


var G__8695 = cljs.core.next.call(null,seq__8654_8688__$1);
var G__8696 = null;
var G__8697 = (0);
var G__8698 = (0);
seq__8654_8678 = G__8695;
chunk__8655_8679 = G__8696;
count__8656_8680 = G__8697;
i__8657_8681 = G__8698;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"*/");

cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,t)," = (function (",cljs.compiler.comma_sep.call(null,fields__$1),"){");

var seq__8658_8699 = cljs.core.seq.call(null,fields__$1);
var chunk__8659_8700 = null;
var count__8660_8701 = (0);
var i__8661_8702 = (0);
while(true){
if((i__8661_8702 < count__8660_8701)){
var fld_8703 = cljs.core._nth.call(null,chunk__8659_8700,i__8661_8702);
cljs.compiler.emitln.call(null,"this.",fld_8703," = ",fld_8703,";");


var G__8704 = seq__8658_8699;
var G__8705 = chunk__8659_8700;
var G__8706 = count__8660_8701;
var G__8707 = (i__8661_8702 + (1));
seq__8658_8699 = G__8704;
chunk__8659_8700 = G__8705;
count__8660_8701 = G__8706;
i__8661_8702 = G__8707;
continue;
} else {
var temp__5720__auto___8708 = cljs.core.seq.call(null,seq__8658_8699);
if(temp__5720__auto___8708){
var seq__8658_8709__$1 = temp__5720__auto___8708;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8658_8709__$1)){
var c__2045__auto___8710 = cljs.core.chunk_first.call(null,seq__8658_8709__$1);
var G__8711 = cljs.core.chunk_rest.call(null,seq__8658_8709__$1);
var G__8712 = c__2045__auto___8710;
var G__8713 = cljs.core.count.call(null,c__2045__auto___8710);
var G__8714 = (0);
seq__8658_8699 = G__8711;
chunk__8659_8700 = G__8712;
count__8660_8701 = G__8713;
i__8661_8702 = G__8714;
continue;
} else {
var fld_8715 = cljs.core.first.call(null,seq__8658_8709__$1);
cljs.compiler.emitln.call(null,"this.",fld_8715," = ",fld_8715,";");


var G__8716 = cljs.core.next.call(null,seq__8658_8709__$1);
var G__8717 = null;
var G__8718 = (0);
var G__8719 = (0);
seq__8658_8699 = G__8716;
chunk__8659_8700 = G__8717;
count__8660_8701 = G__8718;
i__8661_8702 = G__8719;
continue;
}
} else {
}
}
break;
}

var seq__8662_8720 = cljs.core.seq.call(null,pmasks);
var chunk__8663_8721 = null;
var count__8664_8722 = (0);
var i__8665_8723 = (0);
while(true){
if((i__8665_8723 < count__8664_8722)){
var vec__8672_8724 = cljs.core._nth.call(null,chunk__8663_8721,i__8665_8723);
var pno_8725 = cljs.core.nth.call(null,vec__8672_8724,(0),null);
var pmask_8726 = cljs.core.nth.call(null,vec__8672_8724,(1),null);
cljs.compiler.emitln.call(null,"this.cljs$lang$protocol_mask$partition",pno_8725,"$ = ",pmask_8726,";");


var G__8727 = seq__8662_8720;
var G__8728 = chunk__8663_8721;
var G__8729 = count__8664_8722;
var G__8730 = (i__8665_8723 + (1));
seq__8662_8720 = G__8727;
chunk__8663_8721 = G__8728;
count__8664_8722 = G__8729;
i__8665_8723 = G__8730;
continue;
} else {
var temp__5720__auto___8731 = cljs.core.seq.call(null,seq__8662_8720);
if(temp__5720__auto___8731){
var seq__8662_8732__$1 = temp__5720__auto___8731;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8662_8732__$1)){
var c__2045__auto___8733 = cljs.core.chunk_first.call(null,seq__8662_8732__$1);
var G__8734 = cljs.core.chunk_rest.call(null,seq__8662_8732__$1);
var G__8735 = c__2045__auto___8733;
var G__8736 = cljs.core.count.call(null,c__2045__auto___8733);
var G__8737 = (0);
seq__8662_8720 = G__8734;
chunk__8663_8721 = G__8735;
count__8664_8722 = G__8736;
i__8665_8723 = G__8737;
continue;
} else {
var vec__8675_8738 = cljs.core.first.call(null,seq__8662_8732__$1);
var pno_8739 = cljs.core.nth.call(null,vec__8675_8738,(0),null);
var pmask_8740 = cljs.core.nth.call(null,vec__8675_8738,(1),null);
cljs.compiler.emitln.call(null,"this.cljs$lang$protocol_mask$partition",pno_8739,"$ = ",pmask_8740,";");


var G__8741 = cljs.core.next.call(null,seq__8662_8732__$1);
var G__8742 = null;
var G__8743 = (0);
var G__8744 = (0);
seq__8662_8720 = G__8741;
chunk__8663_8721 = G__8742;
count__8664_8722 = G__8743;
i__8665_8723 = G__8744;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"});");

return cljs.compiler.emit.call(null,body);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"defrecord","defrecord",-1367493418),(function (p__8745){
var map__8746 = p__8745;
var map__8746__$1 = cljs.core.__destructure_map.call(null,map__8746);
var t = cljs.core.get.call(null,map__8746__$1,new cljs.core.Keyword(null,"t","t",-1397832519));
var fields = cljs.core.get.call(null,map__8746__$1,new cljs.core.Keyword(null,"fields","fields",-1932066230));
var pmasks = cljs.core.get.call(null,map__8746__$1,new cljs.core.Keyword(null,"pmasks","pmasks",-871416698));
var body = cljs.core.get.call(null,map__8746__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
var protocols = cljs.core.get.call(null,map__8746__$1,new cljs.core.Keyword(null,"protocols","protocols",-5615896));
var fields__$1 = cljs.core.concat.call(null,cljs.core.map.call(null,cljs.compiler.munge,fields),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Symbol(null,"__meta","__meta",-946752628,null),new cljs.core.Symbol(null,"__extmap","__extmap",-1435580931,null),new cljs.core.Symbol(null,"__hash","__hash",-1328796629,null)], null));
cljs.compiler.emitln.call(null,"");

cljs.compiler.emitln.call(null,"/**");

cljs.compiler.emitln.call(null,"* @constructor");

var seq__8747_8771 = cljs.core.seq.call(null,protocols);
var chunk__8748_8772 = null;
var count__8749_8773 = (0);
var i__8750_8774 = (0);
while(true){
if((i__8750_8774 < count__8749_8773)){
var protocol_8775 = cljs.core._nth.call(null,chunk__8748_8772,i__8750_8774);
cljs.compiler.emitln.call(null," * @implements {",cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(protocol_8775))),"}");


var G__8776 = seq__8747_8771;
var G__8777 = chunk__8748_8772;
var G__8778 = count__8749_8773;
var G__8779 = (i__8750_8774 + (1));
seq__8747_8771 = G__8776;
chunk__8748_8772 = G__8777;
count__8749_8773 = G__8778;
i__8750_8774 = G__8779;
continue;
} else {
var temp__5720__auto___8780 = cljs.core.seq.call(null,seq__8747_8771);
if(temp__5720__auto___8780){
var seq__8747_8781__$1 = temp__5720__auto___8780;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8747_8781__$1)){
var c__2045__auto___8782 = cljs.core.chunk_first.call(null,seq__8747_8781__$1);
var G__8783 = cljs.core.chunk_rest.call(null,seq__8747_8781__$1);
var G__8784 = c__2045__auto___8782;
var G__8785 = cljs.core.count.call(null,c__2045__auto___8782);
var G__8786 = (0);
seq__8747_8771 = G__8783;
chunk__8748_8772 = G__8784;
count__8749_8773 = G__8785;
i__8750_8774 = G__8786;
continue;
} else {
var protocol_8787 = cljs.core.first.call(null,seq__8747_8781__$1);
cljs.compiler.emitln.call(null," * @implements {",cljs.compiler.munge.call(null,(""+cljs.core.str.cljs$core$IFn$_invoke$arity$1(protocol_8787))),"}");


var G__8788 = cljs.core.next.call(null,seq__8747_8781__$1);
var G__8789 = null;
var G__8790 = (0);
var G__8791 = (0);
seq__8747_8771 = G__8788;
chunk__8748_8772 = G__8789;
count__8749_8773 = G__8790;
i__8750_8774 = G__8791;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"*/");

cljs.compiler.emitln.call(null,cljs.compiler.munge.call(null,t)," = (function (",cljs.compiler.comma_sep.call(null,fields__$1),"){");

var seq__8751_8792 = cljs.core.seq.call(null,fields__$1);
var chunk__8752_8793 = null;
var count__8753_8794 = (0);
var i__8754_8795 = (0);
while(true){
if((i__8754_8795 < count__8753_8794)){
var fld_8796 = cljs.core._nth.call(null,chunk__8752_8793,i__8754_8795);
cljs.compiler.emitln.call(null,"this.",fld_8796," = ",fld_8796,";");


var G__8797 = seq__8751_8792;
var G__8798 = chunk__8752_8793;
var G__8799 = count__8753_8794;
var G__8800 = (i__8754_8795 + (1));
seq__8751_8792 = G__8797;
chunk__8752_8793 = G__8798;
count__8753_8794 = G__8799;
i__8754_8795 = G__8800;
continue;
} else {
var temp__5720__auto___8801 = cljs.core.seq.call(null,seq__8751_8792);
if(temp__5720__auto___8801){
var seq__8751_8802__$1 = temp__5720__auto___8801;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8751_8802__$1)){
var c__2045__auto___8803 = cljs.core.chunk_first.call(null,seq__8751_8802__$1);
var G__8804 = cljs.core.chunk_rest.call(null,seq__8751_8802__$1);
var G__8805 = c__2045__auto___8803;
var G__8806 = cljs.core.count.call(null,c__2045__auto___8803);
var G__8807 = (0);
seq__8751_8792 = G__8804;
chunk__8752_8793 = G__8805;
count__8753_8794 = G__8806;
i__8754_8795 = G__8807;
continue;
} else {
var fld_8808 = cljs.core.first.call(null,seq__8751_8802__$1);
cljs.compiler.emitln.call(null,"this.",fld_8808," = ",fld_8808,";");


var G__8809 = cljs.core.next.call(null,seq__8751_8802__$1);
var G__8810 = null;
var G__8811 = (0);
var G__8812 = (0);
seq__8751_8792 = G__8809;
chunk__8752_8793 = G__8810;
count__8753_8794 = G__8811;
i__8754_8795 = G__8812;
continue;
}
} else {
}
}
break;
}

var seq__8755_8813 = cljs.core.seq.call(null,pmasks);
var chunk__8756_8814 = null;
var count__8757_8815 = (0);
var i__8758_8816 = (0);
while(true){
if((i__8758_8816 < count__8757_8815)){
var vec__8765_8817 = cljs.core._nth.call(null,chunk__8756_8814,i__8758_8816);
var pno_8818 = cljs.core.nth.call(null,vec__8765_8817,(0),null);
var pmask_8819 = cljs.core.nth.call(null,vec__8765_8817,(1),null);
cljs.compiler.emitln.call(null,"this.cljs$lang$protocol_mask$partition",pno_8818,"$ = ",pmask_8819,";");


var G__8820 = seq__8755_8813;
var G__8821 = chunk__8756_8814;
var G__8822 = count__8757_8815;
var G__8823 = (i__8758_8816 + (1));
seq__8755_8813 = G__8820;
chunk__8756_8814 = G__8821;
count__8757_8815 = G__8822;
i__8758_8816 = G__8823;
continue;
} else {
var temp__5720__auto___8824 = cljs.core.seq.call(null,seq__8755_8813);
if(temp__5720__auto___8824){
var seq__8755_8825__$1 = temp__5720__auto___8824;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8755_8825__$1)){
var c__2045__auto___8826 = cljs.core.chunk_first.call(null,seq__8755_8825__$1);
var G__8827 = cljs.core.chunk_rest.call(null,seq__8755_8825__$1);
var G__8828 = c__2045__auto___8826;
var G__8829 = cljs.core.count.call(null,c__2045__auto___8826);
var G__8830 = (0);
seq__8755_8813 = G__8827;
chunk__8756_8814 = G__8828;
count__8757_8815 = G__8829;
i__8758_8816 = G__8830;
continue;
} else {
var vec__8768_8831 = cljs.core.first.call(null,seq__8755_8825__$1);
var pno_8832 = cljs.core.nth.call(null,vec__8768_8831,(0),null);
var pmask_8833 = cljs.core.nth.call(null,vec__8768_8831,(1),null);
cljs.compiler.emitln.call(null,"this.cljs$lang$protocol_mask$partition",pno_8832,"$ = ",pmask_8833,";");


var G__8834 = cljs.core.next.call(null,seq__8755_8825__$1);
var G__8835 = null;
var G__8836 = (0);
var G__8837 = (0);
seq__8755_8813 = G__8834;
chunk__8756_8814 = G__8835;
count__8757_8815 = G__8836;
i__8758_8816 = G__8837;
continue;
}
} else {
}
}
break;
}

cljs.compiler.emitln.call(null,"});");

return cljs.compiler.emit.call(null,body);
}));
cljs.compiler.emit_dot = (function cljs$compiler$emit_dot(p__8838){
var map__8839 = p__8838;
var map__8839__$1 = cljs.core.__destructure_map.call(null,map__8839);
var target = cljs.core.get.call(null,map__8839__$1,new cljs.core.Keyword(null,"target","target",253001721));
var field = cljs.core.get.call(null,map__8839__$1,new cljs.core.Keyword(null,"field","field",-1302436500));
var method = cljs.core.get.call(null,map__8839__$1,new cljs.core.Keyword(null,"method","method",55703592));
var args = cljs.core.get.call(null,map__8839__$1,new cljs.core.Keyword(null,"args","args",1315556576));
var env = cljs.core.get.call(null,map__8839__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(cljs.core.truth_(field)){
cljs.compiler.emits.call(null,target,".",cljs.compiler.munge.call(null,field,cljs.core.PersistentHashSet.EMPTY));
} else {
cljs.compiler.emits.call(null,target,".",cljs.compiler.munge.call(null,method,cljs.core.PersistentHashSet.EMPTY),"(",cljs.compiler.comma_sep.call(null,args),")");
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
});
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"host-field","host-field",-72662140),(function (ast){
return cljs.compiler.emit_dot.call(null,ast);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"host-call","host-call",1059629755),(function (ast){
return cljs.compiler.emit_dot.call(null,ast);
}));
cljs.core._add_method.call(null,cljs.compiler.emit_STAR_,new cljs.core.Keyword(null,"js","js",1768080579),(function (p__8840){
var map__8841 = p__8840;
var map__8841__$1 = cljs.core.__destructure_map.call(null,map__8841);
var op = cljs.core.get.call(null,map__8841__$1,new cljs.core.Keyword(null,"op","op",-1882987955));
var env = cljs.core.get.call(null,map__8841__$1,new cljs.core.Keyword(null,"env","env",-1815813235));
var code = cljs.core.get.call(null,map__8841__$1,new cljs.core.Keyword(null,"code","code",1586293142));
var segs = cljs.core.get.call(null,map__8841__$1,new cljs.core.Keyword(null,"segs","segs",-1940299576));
var args = cljs.core.get.call(null,map__8841__$1,new cljs.core.Keyword(null,"args","args",1315556576));
if(cljs.core.truth_((function (){var and__1511__auto__ = code;
if(cljs.core.truth_(and__1511__auto__)){
return goog.string.startsWith(clojure.string.trim.call(null,code),"/*");
} else {
return and__1511__auto__;
}
})())){
return cljs.compiler.emits.call(null,code);
} else {
var env__141__auto__ = env;
if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"return","return",-1891502105),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
cljs.compiler.emits.call(null,"return ");
} else {
}

if(cljs.core.truth_(code)){
cljs.compiler.emits.call(null,code);
} else {
cljs.compiler.emits.call(null,cljs.core.interleave.call(null,cljs.core.concat.call(null,segs,cljs.core.repeat.call(null,null)),cljs.core.concat.call(null,args,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [null], null))));
}

if(cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"expr","expr",745722291),new cljs.core.Keyword(null,"context","context",-830191113).cljs$core$IFn$_invoke$arity$1(env__141__auto__))){
return null;
} else {
return cljs.compiler.emitln.call(null,";");
}
}
}));
cljs.compiler.emit_constants_table = (function cljs$compiler$emit_constants_table(table){
cljs.compiler.emitln.call(null,"goog.provide('",cljs.compiler.munge.call(null,cljs.analyzer.constants_ns_sym),"');");

cljs.compiler.emitln.call(null,"goog.require('cljs.core');");

var seq__8846 = cljs.core.seq.call(null,table);
var chunk__8847 = null;
var count__8848 = (0);
var i__8849 = (0);
while(true){
if((i__8849 < count__8848)){
var vec__8856 = cljs.core._nth.call(null,chunk__8847,i__8849);
var sym = cljs.core.nth.call(null,vec__8856,(0),null);
var value = cljs.core.nth.call(null,vec__8856,(1),null);
var ns_8862 = cljs.core.namespace.call(null,sym);
var name_8863 = cljs.core.name.call(null,sym);
cljs.compiler.emits.call(null,"cljs.core.",value," = ");

if((sym instanceof cljs.core.Keyword)){
cljs.compiler.emits_keyword.call(null,sym);
} else {
if((sym instanceof cljs.core.Symbol)){
cljs.compiler.emits_symbol.call(null,sym);
} else {
throw cljs.core.ex_info.call(null,(""+"Cannot emit constant for type "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.type.call(null,sym))),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"error","error",-978969032),new cljs.core.Keyword(null,"invalid-constant-type","invalid-constant-type",1294847471),new cljs.core.Keyword("clojure.error","phase","clojure.error/phase",275140358),new cljs.core.Keyword(null,"compilation","compilation",-1328774561)], null));

}
}

cljs.compiler.emits.call(null,";\n");


var G__8864 = seq__8846;
var G__8865 = chunk__8847;
var G__8866 = count__8848;
var G__8867 = (i__8849 + (1));
seq__8846 = G__8864;
chunk__8847 = G__8865;
count__8848 = G__8866;
i__8849 = G__8867;
continue;
} else {
var temp__5720__auto__ = cljs.core.seq.call(null,seq__8846);
if(temp__5720__auto__){
var seq__8846__$1 = temp__5720__auto__;
if(cljs.core.chunked_seq_QMARK_.call(null,seq__8846__$1)){
var c__2045__auto__ = cljs.core.chunk_first.call(null,seq__8846__$1);
var G__8868 = cljs.core.chunk_rest.call(null,seq__8846__$1);
var G__8869 = c__2045__auto__;
var G__8870 = cljs.core.count.call(null,c__2045__auto__);
var G__8871 = (0);
seq__8846 = G__8868;
chunk__8847 = G__8869;
count__8848 = G__8870;
i__8849 = G__8871;
continue;
} else {
var vec__8859 = cljs.core.first.call(null,seq__8846__$1);
var sym = cljs.core.nth.call(null,vec__8859,(0),null);
var value = cljs.core.nth.call(null,vec__8859,(1),null);
var ns_8872 = cljs.core.namespace.call(null,sym);
var name_8873 = cljs.core.name.call(null,sym);
cljs.compiler.emits.call(null,"cljs.core.",value," = ");

if((sym instanceof cljs.core.Keyword)){
cljs.compiler.emits_keyword.call(null,sym);
} else {
if((sym instanceof cljs.core.Symbol)){
cljs.compiler.emits_symbol.call(null,sym);
} else {
throw cljs.core.ex_info.call(null,(""+"Cannot emit constant for type "+cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.type.call(null,sym))),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"error","error",-978969032),new cljs.core.Keyword(null,"invalid-constant-type","invalid-constant-type",1294847471),new cljs.core.Keyword("clojure.error","phase","clojure.error/phase",275140358),new cljs.core.Keyword(null,"compilation","compilation",-1328774561)], null));

}
}

cljs.compiler.emits.call(null,";\n");


var G__8874 = cljs.core.next.call(null,seq__8846__$1);
var G__8875 = null;
var G__8876 = (0);
var G__8877 = (0);
seq__8846 = G__8874;
chunk__8847 = G__8875;
count__8848 = G__8876;
i__8849 = G__8877;
continue;
}
} else {
return null;
}
}
break;
}
});
cljs.compiler.emit_externs = (function cljs$compiler$emit_externs(var_args){
var G__8879 = arguments.length;
switch (G__8879) {
case 1:
return cljs.compiler.emit_externs.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 4:
return cljs.compiler.emit_externs.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
default:
throw (new Error(["Invalid arity: ",arguments.length].join("")));

}
});

(cljs.compiler.emit_externs.cljs$core$IFn$_invoke$arity$1 = (function (externs){
return cljs.compiler.emit_externs.call(null,cljs.core.PersistentVector.EMPTY,externs,cljs.core.atom.call(null,cljs.core.PersistentHashSet.EMPTY),(cljs.core.truth_(cljs.env._STAR_compiler_STAR_)?cljs.analyzer.get_externs.call(null):null));
}));

(cljs.compiler.emit_externs.cljs$core$IFn$_invoke$arity$4 = (function (prefix,externs,top_level,known_externs){
var ks = cljs.core.seq.call(null,cljs.core.keys.call(null,externs));
while(true){
if(ks){
var k_8884 = cljs.core.first.call(null,ks);
var vec__8880_8885 = cljs.core.conj.call(null,prefix,k_8884);
var top_8886 = cljs.core.nth.call(null,vec__8880_8885,(0),null);
var prefix_SINGLEQUOTE__8887 = vec__8880_8885;
if(((cljs.core.not_EQ_.call(null,new cljs.core.Symbol(null,"prototype","prototype",519166522,null),k_8884)) && ((cljs.core.get_in.call(null,known_externs,prefix_SINGLEQUOTE__8887) == null)))){
if((!(((cljs.core.contains_QMARK_.call(null,cljs.core.deref.call(null,top_level),top_8886)) || (cljs.core.contains_QMARK_.call(null,known_externs,top_8886)))))){
cljs.compiler.emitln.call(null,"var ",clojure.string.join.call(null,".",cljs.core.map.call(null,cljs.compiler.munge,prefix_SINGLEQUOTE__8887)),";");

cljs.core.swap_BANG_.call(null,top_level,cljs.core.conj,top_8886);
} else {
cljs.compiler.emitln.call(null,clojure.string.join.call(null,".",cljs.core.map.call(null,cljs.compiler.munge,prefix_SINGLEQUOTE__8887)),";");
}
} else {
}

var m_8888 = cljs.core.get.call(null,externs,k_8884);
if(cljs.core.empty_QMARK_.call(null,m_8888)){
} else {
cljs.compiler.emit_externs.call(null,prefix_SINGLEQUOTE__8887,m_8888,top_level,known_externs);
}

var G__8889 = cljs.core.next.call(null,ks);
ks = G__8889;
continue;
} else {
return null;
}
break;
}
}));

(cljs.compiler.emit_externs.cljs$lang$maxFixedArity = 4);

