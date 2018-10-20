+++
template = "page.html"
title = "Why I stopped C++"
date =  2018-10-18
draft = true
tags = ["draft", "bioinformatics", "language"]
+++

TL;DR because Rust is cool !!

I have the feeling that a bioinformatician generaly uses two languages, a language for small scripts, rapid analysis, prototyping (usually an interpreted language) and another when we have performance needs (usually a compiled language).

Until what time these two languages for me was python and C++. If you follow me on twitter you probably saw my last two tools [yacrd](https://github.com/natir/yacrd) and [fpa](https://github.com/natir/fpa), these two tools were written in Rust.

This blog post will talk about why I moved from c++ to Rust and why I think Rust could be a go language for bioinformatic.

# Rust history

Rust was created by Graydon Hoare developer at Mozzila, it became an official Mozzila project in 2010. Rust is a multi-paradigm compiled language, such as c++, then why create a new language? The main problem of C++ is memory leaks, my colleague spent several days to eliminate all memory problems from a software. This task are hard, consume many time and you can't be sure if it's down.

A number of languages solve this problem with collector's gabrage, each language has its own and we can discuss during many hours of their comparative interest but there is one thing I am on it that always has an impact on performance and have memory cost.

# Pro 

Rust is performante, [The Computer Benchmark Language](https://benchmarksgame-team.pages.debian.net/benchmarksgame/) provide many data, this is a resume :

{{ plotly(id="cputime", src="cputime.js") }}

{{ plotly(id="memory", src="memory.js") }}

Rust is equivalent or better than c++ in cpu time and memory usage, but isn't a huge innovation.

A main principe of Rust is if your code compile it will not contains any memory leak [^1], for me it's a killer feature, and that's not all !! The two other main functionality of Rust for me is threads without data races and efficient C bindings. We can write somthing like that `Rust = C++ + multi-thread system without datarace + memory safety` ok it's cool but it's not necessarily enough to justify the cost of a language change. 

## cargo

cargo is an usefull tools, it's main tool you use if you make rust. cargo a compile, test, benchmark, dependency, packaging manager !!


Crates.io

Bioconda

## comunity

The rust community is realy open and all people 

# Con

## new notion

Rust contains many new notion.

## new language less contributor

## External resource

- [Rust vs C++](https://www.slideshare.net/corehard_by/rust-vs-c) slide create for C++ CoreHard Conference
- [The Computer benchmark game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/)


[^1]: In fact if you realy want create a memory leak it's possible, with `unsafe` keyword or if you follow this [page method](https://doc.rust-lang.org/nomicon/leaking.html) but who want do think like that ? 

