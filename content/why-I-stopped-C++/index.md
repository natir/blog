+++
template = "page.html"
title = "Why I stopped C++"
date =  2018-10-18
draft = true
tags = ["draft", "bioinformatics", "language"]
+++

{% include setup %}

# Why I stopped C++

TL;DR because Rust is cool !!

I have the feeling that a bioinformatician uses two languages, a language for small scripts, rapid analysis, prototyping (usually an interpreted language) and another when we have performance needs (usually a compiled language). I'm done saying obvious things.

Until what time these two languages for me was python and C++. If you follow me on twitter you probably saw my last two tools [yacrd](https://github.com/natir/yacrd) and [fpa](https://github.com/natir/fpa), these two tools were written in Rust.

This blog post will talk about why I moved from c++ to Rust and why I think you should do it.

# Rust history

Rust was created by Graydon Hoare developer at Mozzila, it became an official Mozzila project in 2010. Rust and a multi-paradigm compiled language, such as c++, then why create a new language? The main problem of C++ is memory leaks, my colleague spent several more days eliminating all memory problems from a software.
And I think that no C++ programmer can say that he is 100% sure that none of these programs contain memory leakage, or he has wasted a lot of time making sure of that.

A number of languages have chosen to solve this problem because of collector's gabrage, each language has its own and we can discuss the hours of their comparative interest but there is one thing I am on it that always has an impact on performance.

Rust guarantees you that if your program compiles it will not have any memory leak, in fact you can do it with unsafe keyword or if you do it on purpose [this page shows some method](https://doc.rust-lang.org/nomicon/leaking.html). Rust encourages usage of [RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization) Resource Acquistion Is Initialization if an object 

# Pro

## no memory leak

Rust was create for that if you 

## time and memory

Benchmark language 

## cargo

cargo is an usefull tools, it's main tool you use if you make rust. Compile, test, benchmark, dependency, packaging manager !!

### build

### test

### dependency management 

### packaging

Crates.io

Bioconda

## comunity

The rust community is realy open and all people 

# Con

## new notion

Rust contains many new notion.

## new language less contributor

