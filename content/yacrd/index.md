+++
template = "page.html"
title = "Yacrd or the hard way to build a bioinformatics tools"
date = 2018-06-18
draft = true
tags = ["overlapper", "benchmark", "long-reads"]
+++


{% include setup %}

# Yacrd: or the hard way to build a bioinformatics tools

First how sequencing work (very very rougly) :

1. extract DNA
2. cut in little fragment
3. sequence this fragment

Sometimes between step 2 and 3 little fragment merged in bigger fragmente, and sequencer generate a chimeric reads.

Chimeric reads trouble in many type of analysis, in assembly it connects remote regions of the genome, and create mis-assembly. Many tools exist to detect and remove/split this chimeric read.

## Why

I create Yacrd because I didn't find standalon tools for detect chimeric read in long read dataset without correcte this read. We can mention Dasscruber tools, but they do some other modification on read and bigger problem it's only work with dagliner.

## How

![Yacrd use long read mapping result to compute coverage of read and find gap in this coverage] ({{ POST_ASSETS_PATH }}/img/algoritm.png)

We can define YACRD algorithm like :
1. parse output of long read mapping
2. For each read :
    1. Compute the coverage curve of this read
    2. Find where coverage are less than a threshold

The idea is very very simply so I begin to write yacrd in python

#### Python Version 0.0

First we need read against read information minimap are pretty effecient tools for that. We can convert minimap output (a tsv with readname and mapping position) in a hashtable they associate read and all interval where they are covered by another read.

After we construct this table we can iterate over each read, and construct for each read the covered curve, this curve are modelise by a 1D table with size equal to the size of read and for each base a count of coverage level at this position at this end we rescreen the coverage table to found where the coverage drop of a threshold.

At this point we can observe some case :

![gap at begin in middle and at end of read huge gap]({{ POST_ASSETS_PATH }}/img/gap_position.png)

The gap at begin and end are algorithm gap some mapping tools didn't try to extend overlap to the end or begin of ther read, so the position at begin/end of read aren't realy coverage gap.
I observe some read where they have no overlap or just one or two read I called this read Not_covered if a read have a very small number of overlap this read provide any information or how we can trust in this information.

This first unpublish prototype work on simple example but on real data we experiment a huge performance issue. 

#### C++ Arbok, Kabuto

Python version are slow but they validate the algorithm, so I just rewrite this algorithm in C++, this is the version 0.1 of Yacrd. After some discussion with [Maël Kerbiriou](https://twitter.com/wDimD) he rewrite the algorithm.

Maël replace the huge table of coverage by a priority queue of interval.

```
gap_list <- {}
queue <- {}
map_interval <- sort of mapping interval
gap_begin
for each interval in map_interval:
    for each i in queue:
	if i.end < interval.begin:
	    gap_begin = i.end
	    queue.pop(i)

    if length of queue < threshold:
	gap_list.add(gap_begin, intervale.begin)

    queue.add(interval)
```

If we assume the memory alocation are made in $O(1)$. The complexity of naive algorithm are $O(n \dot 2m)$ where m is the mean number of base in read, m the number of read, the complexity of Maël algorithm are near $O(m \dot i)$ where i is the number of mapping interval. Generaly $i << m$.

Maël add some C++ triks to read file more efficiently, read her [pull request](https://github.com/natir/yacrd/pull/8) it's very intersting.

Plus/Minus of this version.

Plus:

- code are speed

Minus:

- depency management are horrible

The performance improvement is due to the use of a compiled language but also has improvements in the algorithm. But the evolution of programme are little bit harder specialy when this fonctionality required to add dependency in project.

If I want continue to add fonctionality in yacrd I need a langage with good performance, an easy dependancy management so I select ~~Go~~ Rust.

#### Rust Ninetales

Ok I just completle rewrite yacrd in Rust, it's was my first Rust application so I loss many time on stupid error and I probably the worst possible code.

I want to be sure result on real dataset are same between version Kabuto and Ninetales so I reuse *E. coli* Pacbio dataset from by last [blog post](http://blog.pierre.marijon.fr/2018/04/13/long-reads-overlapper-compare#datasets)

Run on result of this command : 

```
minimap -x ava10k -k 14 e_coli_pacbio.fasta e_coli_pacbio.fasta > minimap_pacbio.paf
```
e_coli_pacbio.fasta come for [DevNet pacbio](https://github.com/PacificBiosciences/DevNet/wiki/E.-coli-Bacterial-Assembly) 589 MB 

```
/usr/bin/time yacrd0.2.1 -i minimap_pacbio.paf
18.52 user 0.57 system 19.22 elapsed
```

```
/usr/bin/time yacrd0.3 -i minimap_pacbio.paf
20.09 user 0.62 system 20.88 elapsed
```

The rust version is slower indeed but the benefits are HUGE:

- simple dependency management
- integrated test framework
- sure not to have a memory leak
- future developments are easier
- I like this language:)

## Conclusion

it's work

algo is simple but implementation change many think

rust better than c++ because code are shorter, and dependancie management is simple

Ok I plan feature required for version 1.0 in [this issue](https://github.com/natir/yacrd/issues/12), but I'm open to any suggestion.

And I think that having in addition to the fixed threshold a dynamic threshold based on the reads coverage that shares a similar region with the target reads, would be a good idea.

## Thanks

Mael for the new algorithm, and some c++ tricks

Rayan Chikhi and Jean Stéphane Varré for correction

## Version naming convention

Build a string with contributors initial and version number transformed all characters into their base values64, apply a modulo 150 go look for the pokemon pokedex in the pokemon generation according to the major version number 0 generation 1, 1 generation 2, ...

