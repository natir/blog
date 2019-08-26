+++
template = "page.html"
title = "Uncorrected long-read misassemblies"
date = 2019-08-23
draft = true
tags = ["long-read", "assembly", "evaluation"]
+++

If you are reading this, you probably know I work on long read genome assembly. I think all the people who have ever done a genome assembly one day say: "Ok my assembly was cool, but how I can be sure it's the best possible one and they didn't contains many errro ?"

We have many technics to evaluate the quality of assembly (isn't a complet review sorry):
- wih only assembly information:
  + [N50 family metrics](https://doi.org/10.1089/cmb.2017.0013)
  + read remapping ([ASMOValidate](http://amos.sourceforge.net/wiki/index.php/Amosvalidate), [REAPR](https://www.sanger.ac.uk/science/tools/reapr), [FRCbam](https://github.com/vezzi/FRC_align), [Pilon](https://github.com/broadinstitute/pilon/wiki), [VALET](https://www.cbcb.umd.edu/software/valet)) 
  + probability of this reads come from this assembly ([ALE](https://doi.org/10.1093/bioinformatics/bts723), [CGAL](https://doi.org/10.1186/gb-2013-14-1-r8), [LAP](https://doi.org/10.1186/1756-0500-6-334))
- by use external information: 
  + [BUSCO](https://busco.ezlab.org/)
  + transcriptome information [for example *Bos taurus* genome validation](https://doi.org/10.1186/gb-2009-10-4-r42)
  + synteny information [Lui et al](https://doi.org/10.1186/s12859-018-2026-4)
  + [quast](https://doi.org/10.1093/bioinformatics/btt086) assembly against near genome 
  + quast assembly against reference genome
  
If you use quast to reference genome, you have a reference genome, so why you want preform an assembly ?

The main case where we perform something like that was when we want evaluate differente assembly pipeline on same read data set. To evaluate a complete new assembly pipeline, test different set of parameter, evaluate the impact of add or change a tools in an assembly pipeline.

Quast was a very usefull tools and they integrate now many other assembly evaluating tools (BUSCO, [GeneMark](http://exon.gatech.edu/GeneMark/), [GlimmerHMM](https://doi.org/10.1093/bioinformatics/bth315), [barnap](https://github.com/tseemann/barrnap))

Recently, with Rayan Chikhi and Jean-Stéphane Varré, I publish a [preprint](https://www.biorxiv.org/content/10.1101/674036v2) about [yacrd](https://github.com/natir/yacrd/) and [fpa](https://github.com/natir/fpa), two standalon tools they can be introduce in assembly pipeline to remove very bad reads region and filter out low quality overlap. We evaluate effect of this tools on without correction assembly pipeline ([miniasm](https://github.com/lh3/miniasm) and [redbean](https://github.com/ruanjue/wtdbg2)) and evaluate assembly quality with quast.

We send this paper to a journal, and Reviewer 3 say something like that "quast isn't a good tools to evaluate high error assembly, the number of misassemblies was probably over evaluate." and it's true. Miniasm and redbean perform an assembly without read correction step (and without consensus step form miniasm). The low quality of contigs sequence, have important impact on her mappability and quast could confuse a low quality region misaligned with a misassemblies. First question what is a quast misassemblies?

## Quast misassemblies definition

To define quast misassemblies we going to use simple exemple, we have a genome with one no circular chromosomes, our assembly contains only one contigs, this contigs sometimes map against the reference(green part) and sometimes didn't map (red part).

<script type="text/tikz">
  \begin{tikzpicture}[x=0.75pt,y=0.75pt,yscale=-1,xscale=1]
	\draw [|-|] (0, -10) -- (800, -10) node[pos=0.5,above] {Chromosome};
	\draw [fill=black] (0,0) -- (800, 0) -- (800, 40) -- (0, 40) -- cycle;
	
	\draw [fill=black!60!green] (50,0) -- (300, 0) -- (300, 40) -- (50, 40) -- cycle;
	\draw [|-|] (50, 50) -- (300, 50) node[pos=0.5,below=5] {Lx};
	
	\draw [fill=red] (300,0) -- (500, 0) -- (500, 40) -- (300, 40) -- cycle;
	\draw [|-|] (300, 50) -- (500, 50) node[pos=0.5,below=5] {Ly};
	
	\draw [fill=black!60!green] (500,0) -- (730, 0) -- (730, 40) -- (500, 40) -- cycle;
	\draw [|-|] (500, 50) -- (730, 50) node[pos=0.5,below=5] {Lz};
\end{tikzpicture}
</script>

A misassembly occure when, $L_y >$ `--extensive-mis-size` (1kbp by default) option and ($L_x and L_z > 1kbp$ (this value cann't be change?). In case reference contains some chromosome, if a contig map (mappings length upper than 1kbp) on two chromosomes quast count this event as a misassemblies.

This is the basic type of misassemblies, assembly mis a large part of assembly, a **Relocation**. **Translocation** occure when a contigs map on two different chromosome. **Inversion** occure when contig map on same chromosome but in differente strand.

**Important note :**
- alignement with an identity lower than `--min-identity` (95% by default minimum 80%) aren't used by quast
- to perform alignement of contigs against references recent version of quast use [minimap2](https://github.com/lh3/minimap2), with preset `-x asm20` [when --min-identity is lower than 90%](https://github.com/ablab/quast/blob/b040cc9140c7630eea95f94cdda3b825cf4a22c3/quast_libs/ca_utils/align_contigs.py#L65)

If `--min-identity` was to high a good alignment can be filter out and create a large gap in mapping count as misassemblies. If `--extensive-mis-size` was to small many short gap create by errors in contigs can be count as misassemblies.

We can tune this two parametre to determinate our impact on misassemblies count.

## Dataset assembly pipeline and quast option

For this test we are going to use two Nanopore dataset and one Pacbio dataset.
- Reads:
  * [Oxford nanopore D melanogaster](https://www.ebi.ac.uk/ena/data/view/SRX3676783)
  * [Oxford nanopore H sapiens chr1](http://s3.amazonaws.com/nanopore-human-wgs/chr1.sorted.bam)
  * [Pacbio RS P6-C4 C elegans](http://datasets.pacb.com.s3.amazonaws.com/2014/c_elegans/list.html)
- References:
  * [D. melanogaster](https://www.ncbi.nlm.nih.gov/assembly/GCF_000001215.4) 143.726002 Mb
  * [C. elegans](ftp://ftp.ensembl.org/pub/release-95/fasta/caenorhabditis_elegans/dna/Caenorhabditis_elegans.WBcel235.dna.toplevel.fa.gz) 100.2 Mb
  * [H. sapiens chr1](ftp://ftp.ensembl.org/pub/release-95/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.chromosome.1.fa.gz) 248.9 Mb
  
To perform assembly we use Minimap2 (version 2.16-r922) and Miniasm (version 0.3-r179) with recommand preset for each sequencing technology (`ava-ont` and `ava-pb`).

We launch several times quast (version v5.0.2) with parameter `--extensive-min-size` begining at 10000 (default value) to 10.000 with a step of 1000, the parameter `--min-identity` was fix at 80 % on this three datasets.

## Effect of increase --extensive-min-size

{{ plotly(id="nb_breakpoint", src="nb_breakpoint.js") }}

This graph shows the evolution of the number of misassemblies in function of the parameter values `--extensive-min-size`, when this value is equal to 20000 they drop drasticly and remains stable.

This graph show to type of misassemblies where gap was between 1000 and 10.000 bases and another where gap are larger than 10.000 bases.

## Dotplot of small misassemblies and large misassemblies

We try to observe the difference between "short" and "large" misassemblies 
	
## Conclusion

I think misassemblies Quast metrics was good, for long reads uncorrected assemblies maybe the name isn't the good one, large unalignement was a better name ? Finaly it's still an assemblies evaluation metrics if you reduce the *# misassemblies* number you improve your assemblies.

But it's a good think to check the size of breakpoint generate misassemblies to be sure, you didn't reduce the number of short misassemblies to increase the number of large misassemblies.

## Acknowledgement
