// Compiled by ClojureScript 1.12.146 {:target :default, :optimizations :simple}
goog.provide('cljs.analyzer.passes.lite');
goog.require('cljs.core');
cljs.analyzer.passes.lite.var_QMARK_ = (function cljs$analyzer$passes$lite$var_QMARK_(ast){
return cljs.core._EQ_.call(null,new cljs.core.Keyword(null,"var","var",-769682797),new cljs.core.Keyword(null,"op","op",-1882987955).cljs$core$IFn$_invoke$arity$1(ast));
});
cljs.analyzer.passes.lite.ctor__GT_ctor_lite = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Symbol("cljs.core","vector","cljs.core/vector",720641726,null),new cljs.core.Symbol("cljs.core","vector-lite","cljs.core/vector-lite",1954842799,null),new cljs.core.Symbol("cljs.core","vec","cljs.core/vec",307622519,null),new cljs.core.Symbol("cljs.core","vec-lite","cljs.core/vec-lite",-1972352564,null)], null);
cljs.analyzer.passes.lite.update_var = (function cljs$analyzer$passes$lite$update_var(p__5470){
var map__5471 = p__5470;
var map__5471__$1 = cljs.core.__destructure_map.call(null,map__5471);
var ast = map__5471__$1;
var name = cljs.core.get.call(null,map__5471__$1,new cljs.core.Keyword(null,"name","name",1843675177));
var replacement = cljs.core.get.call(null,cljs.analyzer.passes.lite.ctor__GT_ctor_lite,name);
return cljs.core.assoc_in.call(null,cljs.core.assoc.call(null,ast,new cljs.core.Keyword(null,"name","name",1843675177),replacement),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"info","info",-317069002),new cljs.core.Keyword(null,"name","name",1843675177)], null),replacement);
});
cljs.analyzer.passes.lite.replace_var_QMARK_ = (function cljs$analyzer$passes$lite$replace_var_QMARK_(ast){
return ((cljs.analyzer.passes.lite.var_QMARK_.call(null,ast)) && (cljs.core.contains_QMARK_.call(null,cljs.analyzer.passes.lite.ctor__GT_ctor_lite,new cljs.core.Keyword(null,"name","name",1843675177).cljs$core$IFn$_invoke$arity$1(ast))));
});
cljs.analyzer.passes.lite.use_lite_types = (function cljs$analyzer$passes$lite$use_lite_types(env,ast,_){
var G__5472 = ast;
if(cljs.analyzer.passes.lite.replace_var_QMARK_.call(null,ast)){
return cljs.analyzer.passes.lite.update_var.call(null,G__5472);
} else {
return G__5472;
}
});
